import { Test, TestingModule } from "@nestjs/testing";
import { MonitoringService } from "./monitoring.service";
import { PrismaService } from "../prisma/prisma.service";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

// Define the shape of the appetite response
const mockAppetiteResponse = {
  thresholds: [
    {
      metric_name: "financial_loss",
      operator: ">",
      limit_value: 10000,
      severity_mapping: {
        "10000": "low",
        "50000": "medium",
        "100000": "critical",
      },
    },
    {
      metric_name: "uptime",
      operator: "<",
      limit_value: 99.9,
      severity_mapping: { "99.9": "low", "99.0": "high", "95.0": "critical" },
    },
  ],
};

global.fetch = jest.fn() as jest.Mock;

describe("MonitoringService (Core Logic)", () => {
  let service: MonitoringService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);

    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  describe("evaluateSeverity", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockAppetiteResponse,
      });
    });

    it('should return "low" if beneath threshold (operator >)', async () => {
      const result = await service["evaluateSeverity"](
        "financial_loss",
        5000,
        "finance",
      );
      expect(result).toBe("low");
    });

    it("should return correct severity mapping for exact triggers (operator >)", async () => {
      const result = await service["evaluateSeverity"](
        "financial_loss",
        60000,
        "finance",
      );
      expect(result).toBe("medium");
    });

    it("should return correct severity mapping for extreme triggers (operator >)", async () => {
      const result = await service["evaluateSeverity"](
        "financial_loss",
        150000,
        "finance",
      );
      expect(result).toBe("critical");
    });

    it("should handle operator < correctly for uptime drop", async () => {
      const result = await service["evaluateSeverity"]("uptime", 96.0, "it");
      expect(result).toBe("high");
    });

    it('should fallback to "none" if appetite service fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Internal Error",
      });
      const result = await service["evaluateSeverity"](
        "financial_loss",
        200000,
        "finance",
      );
      expect(result).toBe("none");
    });
  });

  describe("calculateSLADeadlines", () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("should calculate 1h triage, 8h decision, 7d closure for HIGH severity", () => {
      const slas = service["calculateSLADeadlines"]("high");
      expect(slas.triage_due_at.toISOString()).toBe("2026-01-01T13:00:00.000Z");
      expect(slas.decision_due_at.toISOString()).toBe(
        "2026-01-01T20:00:00.000Z",
      );
      expect(slas.closure_due_at.toISOString()).toBe(
        "2026-01-08T12:00:00.000Z",
      );
    });

    it("should fallback to LOW SLA config for unknown severities", () => {
      const slas = service["calculateSLADeadlines"]("unknown_tier");
      expect(slas.triage_due_at.toISOString()).toBe("2026-01-01T20:00:00.000Z"); // low triage is 480m = 8h
    });
  });
});
