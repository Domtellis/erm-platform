import { Test, TestingModule } from "@nestjs/testing";
import { AiService, BreachDetectedPayload } from "../../src/ai/ai.service";
import { GeminiClient } from "../../src/ai/gemini.client";
import { PrismaService } from "../../src/prisma/prisma.service";
import { OutboxService } from "../../src/outbox/outbox.service";
import { PortContextService } from "../../src/standards/port-context.service";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

describe("Phase 3: AI Chaos Engineering & Resilience", () => {
  let aiService: AiService;
  let geminiClient: DeepMockProxy<GeminiClient>;
  let prisma: DeepMockProxy<PrismaService>;
  let outbox: DeepMockProxy<OutboxService>;
  let portContext: DeepMockProxy<PortContextService>;

  const mockPayload: BreachDetectedPayload = {
    breach_case_id: "chaos-test-01",
    bu_id: "bu-logistics",
    severity: "high",
    title: "Cracked Support Beam",
    metric_name: "structural_integrity",
    observed_value: 95,
  };

  beforeEach(async () => {
    geminiClient = mockDeep<GeminiClient>();
    prisma = mockDeep<PrismaService>();
    outbox = mockDeep<OutboxService>();
    portContext = mockDeep<PortContextService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: GeminiClient, useValue: geminiClient },
        { provide: PrismaService, useValue: prisma },
        { provide: OutboxService, useValue: outbox },
        { provide: PortContextService, useValue: portContext },
      ],
    }).compile();

    aiService = module.get<AiService>(AiService);

    // Default mocks
    portContext.isRegistryHealthy.mockResolvedValue(true);
    portContext.getClausesForMetric.mockResolvedValue([]);
    prisma.modelRegistry.findUnique.mockResolvedValue({
      display_name: "Gemini 2.0 Flash",
    } as any);
    prisma.assessmentSuggestion.upsert.mockResolvedValue({} as any);
    outbox.enqueue.mockResolvedValue({} as any);
    outbox.enqueueWithTx.mockResolvedValue({} as any);

    // Mock $transaction to simply execute the callback with the mock prisma client
    prisma.$transaction.mockImplementation((cb: any) => cb(prisma));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Scenario 3.2: Fatal Hallucinations (Malformed JSON)", () => {
    it("skips retries and routes immediately to DLQ when a parse error occurs", async () => {
      // 1. Mock a Fatal "Parse Error"
      // Note: We mock assessRisk directly to simulate the final failure state
      const fatalError = new Error("Invalid JSON: Unexpected token {");
      // We simulate that the client identifies this as a fatal error
      geminiClient.assessRisk.mockRejectedValue(fatalError);

      // 2. Execute the service handler
      await aiService.handleBreachDetected(mockPayload);

      // 3. ASSERT: No Retries were attempted at the Service level (GeminiClient handles internal retries,
      // but if it's fatal, it should surface immediately)
      expect(geminiClient.assessRisk).toHaveBeenCalledTimes(1);

      // 4. ASSERT: DLQ Routing - A fallback record is created in the database
      // The call is now wrapping in $transaction, but since our mock execute cb(prisma),
      // we can still verify the call on prisma.assessmentSuggestion
      expect(prisma.assessmentSuggestion.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { breach_case_id: mockPayload.breach_case_id },
          create: expect.objectContaining({
            status: "failed",
            unable_to_cite_reason: expect.stringContaining("Assessment failed"),
          }),
        }),
      );

      // 5. ASSERT: DLQ Routing - A failure event is enqueued to Kafka (via Outbox)
      // We now expect enqueueWithTx
      expect(outbox.enqueueWithTx).toHaveBeenCalledWith(
        prisma,
        "erm.risk.assessment-failed.v1",
        expect.objectContaining({
          breach_case_id: mockPayload.breach_case_id,
          reason: fatalError.message,
        }),
      );
    });
  });

  describe("Scenario 3.3: Transient Provider Timeout (Resilience & Backoff)", () => {
    /**
     * Note: To truly test the RxJS retries, we would need to test GeminiClient in isolation.
     * Here we verify that if the retries fail, the AiService still performs DLQ recovery.
     */
    it("exhausts all attempts and routes to DLQ when transient timeouts persist", async () => {
      // 1. Mock a Transient Timeout Error
      const timeoutError = new Error("Gemini API timeout after 10000ms");
      geminiClient.assessRisk.mockRejectedValue(timeoutError);

      // 2. Execute
      await aiService.handleBreachDetected(mockPayload);

      // 3. ASSERT: The service still performs its duty to avoid data loss
      expect(outbox.enqueueWithTx).toHaveBeenCalledWith(
        prisma,
        "erm.risk.assessment-failed.v1",
        expect.objectContaining({
          breach_case_id: mockPayload.breach_case_id,
          reason: timeoutError.message,
        }),
      );

      // Verification of DB fallback
      expect(prisma.assessmentSuggestion.upsert).toHaveBeenCalled();
    });
  });

  describe("Scenario 3.4: Infrastructure Chaos - Kafka Duplicate Delivery (Fast-Path)", () => {
    it("aborts processing instantly if the assessment already exists in the database", async () => {
      // 1. Mock the database finding an existing record
      prisma.assessmentSuggestion.findUnique.mockResolvedValue({
        id: "existing-123",
      } as any);

      // 2. Execute
      await aiService.handleBreachDetected(mockPayload);

      // 3. ASSERT: The AI was NEVER called (saved API money)
      expect(geminiClient.assessRisk).not.toHaveBeenCalled();

      // 4. ASSERT: No duplicate events were published
      expect(outbox.enqueueWithTx).not.toHaveBeenCalled();
      expect(prisma.assessmentSuggestion.upsert).not.toHaveBeenCalled();
    });
  });

  describe("Scenario 3.5: Infrastructure Chaos - Concurrent Database Collision (P2002)", () => {
    it("gracefully swallows the error without routing to DLQ if a concurrent worker beat it to the database", async () => {
      // 1. Mock the fast-path failing (both workers think the DB is empty)
      prisma.assessmentSuggestion.findUnique.mockResolvedValue(null);

      // 2. Mock a successful AI run
      geminiClient.assessRisk.mockResolvedValue({ impact: 4 } as any);

      // 3. Mock the Prisma Transaction throwing the specific P2002 Unique Constraint error
      const p2002Error = new Error(
        "Unique constraint failed on the fields: (`breach_case_id`)",
      );
      (p2002Error as any).code = "P2002"; // Simulate Prisma's error code

      // We force the initial create inside the transaction to throw this
      prisma.assessmentSuggestion.create.mockRejectedValue(p2002Error);

      // 4. Execute
      await aiService.handleBreachDetected(mockPayload);

      // 5. ASSERT: It did NOT trigger the DLQ failure fallback
      expect(prisma.assessmentSuggestion.upsert).not.toHaveBeenCalled();
      expect(outbox.enqueueWithTx).not.toHaveBeenCalledWith(
        prisma,
        "erm.risk.assessment-failed.v1",
        expect.anything(),
      );
    });
  });
});
