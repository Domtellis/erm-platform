import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma-clients/monitoring/runtime/library";
import { PrismaTestEnvironment, truncateDatabase } from "@erm/testing";

describe("Phase 2: Component Integration (Refactored)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    // Scaffold Testcontainers using the shared monorepo testing library
    await PrismaTestEnvironment.setup(
      "monitoring",
      "services/monitoring-and-breaches/schema.prisma",
    );

    // Initialize NestJS properly so lifecycle hooks operate gracefully
    moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
  }, 120000); // Allow sufficient time for initial container pull

  afterAll(async () => {
    // CRITICAL: Explicitly close the Nest application so Prisma disconnects gracefully.
    // This prevents the dreaded "Hanging Jest" process in CI pipelines.
    if (app) await app.close();

    // Deconstruct the Docker container
    await PrismaTestEnvironment.teardown();
  });

  beforeEach(async () => {
    // Utilize lightning-fast TRUNCATE CASCADE to guarantee isolated test states
    // This removes the need for expensive per-test Docker reboots.
    if (prisma) await truncateDatabase(prisma, "monitoring");
  });

  describe("Scenario 2.1 & 2.4: Lightning Fast Truncation Validation", () => {
    it("Block A: Seeds the database safely", async () => {
      // Scenario 2.4: Lightning Fast Truncation Validation - seeding initial data
      const breaches = Array.from({ length: 5 }).map((_, i) => ({
        id: `truncation-seed-${i}`,
        title: `Seed ${i}`,
        metric_name: "latency",
        observed_value: 100,
        site_id: "site-x",
        bu_id: "bu-x",
      }));

      await prisma.breachCase.createMany({ data: breaches });
      const count = await prisma.breachCase.count();
      expect(count).toBe(5);
    });

    it("Block B: Asserts zero state without manual deletion", async () => {
      // Scenario 2.4: The global before-each truncation script should have cascade-emptied the DB instantly.
      // If it failed, this count would remain 5 and cause the test to fail.
      const count = await prisma.breachCase.count();
      expect(count).toBe(0); // If this passes, Truncation Validation succeeds
    });
  });

  describe("Scenario 2.2: Hard Constraint Enforcement", () => {
    it("catches database-level primary key violations properly", async () => {
      const duplicateBreach = {
        id: "pk-violation-test",
        title: "Constraint Test",
        metric_name: "uptime",
        observed_value: 99.9,
        site_id: "site-1",
        bu_id: "bu-1",
      };

      // Step 1: Successful insert
      await prisma.breachCase.create({ data: duplicateBreach });

      // Step 2: The second identical insertion MUST be forcibly rejected by PostgreSQL engine
      await expect(
        prisma.breachCase.create({ data: duplicateBreach }),
      ).rejects.toThrow(PrismaClientKnownRequestError);
    });
  });

  describe("Scenario 2.3: Transactional Rollbacks (Atomicity)", () => {
    it("safely rolls back a partial transaction failure", async () => {
      const step1Id = "atomic-transaction-success-step";

      try {
        await prisma.$transaction([
          // Step 1: Valid data that would theoretically be saved
          prisma.breachCase.create({
            data: {
              id: step1Id,
              title: "Valid Transaction Step",
              metric_name: "uptime",
              observed_value: 99.9,
              site_id: "site-1",
              bu_id: "bu-1",
            },
          }),
          // Step 2: Intentionally violating foreign key constraints
          prisma.evaluation.create({
            data: {
              breach_case_id: "non-existent-breach-id",
              result: "pass",
              criteria_id: "crit-1",
            },
          }),
        ]);
        fail("The transaction failed to throw a foreign key violation.");
      } catch (e) {
        // We caught the expected transaction error. Now we perform the true assertion.
        expect(e).toBeInstanceOf(PrismaClientKnownRequestError);
      }

      // The critical assertion: Step 1 must NOT exist in the database!
      const rollbackCheck = await prisma.breachCase.findUnique({
        where: { id: step1Id },
      });

      expect(rollbackCheck).toBeNull(); // Atomicity successfully validated
    });
  });
});
