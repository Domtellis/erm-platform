import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GeminiClient } from "./gemini.client";
import { OutboxService } from "../outbox/outbox.service";
import { PortContextService } from "../standards/port-context.service";
import {
  assessmentTotal,
  assessmentAccepted,
  assessmentModified,
  assessmentRejected,
  assessmentPending,
  assessmentFailed,
} from "../instrumentation";

export interface BreachDetectedPayload {
  breach_case_id: string;
  bu_id: string;
  severity: string;
  title: string;
  metric_name?: string;
  observed_value?: number;
  threshold?: number;
  site_id?: string;
  detected_at?: string;
}

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiClient: GeminiClient,
    private readonly outboxService: OutboxService,
    private readonly portContextService: PortContextService,
  ) {}

  async onModuleInit() {
    const labels = { model: this.geminiClient.modelVersion };
    assessmentTotal.add(0, labels);
    assessmentFailed.add(0, labels);
    assessmentPending.add(0);
    this.logger.log("AI TRiSM Metrics initialized");
  }

  private async resolveModelDisplayName(modelId: string): Promise<string> {
    try {
      const reg = await this.prisma.modelRegistry.findUnique({
        where: { model_id: modelId },
      });
      return reg?.display_name || modelId;
    } catch (err) {
      this.logger.error(
        `Failed to resolve display name for ${modelId}: ${err.message}`,
      );
      return modelId;
    }
  }

  /**
   * Main entry point — called by the Kafka consumer when a breach is detected.
   *
   * S-AIR Flow:
   * 1. Check Standards Registry health (graceful degradation on empty)
   * 2. Retrieve relevant ILO Port Code clauses (Option B)
   * 3. Pass clauses to Gemini for ISO-grounded assessment (Option A)
   * 4. Persist AssessmentSuggestion + StandardSnapshot (audit trail)
   * 5. Publish events via outbox
   */
  async handleBreachDetected(payload: BreachDetectedPayload): Promise<void> {
    const {
      breach_case_id,
      bu_id,
      severity,
      title,
      metric_name,
      observed_value,
      threshold,
      site_id,
    } = payload;

    this.logger.log(
      `Processing breach ${breach_case_id} for AI assessment | metric: ${metric_name}`,
    );

    assessmentTotal.add(1, {
      severity,
      site_id: site_id || "unknown",
      model: this.geminiClient.modelVersion,
    });

    // Idempotency check
    const existing = await this.prisma.assessmentSuggestion.findUnique({
      where: { breach_case_id: String(breach_case_id) },
    });
    if (existing) {
      this.logger.warn(
        `Assessment already exists for breach ${breach_case_id} — skipping`,
      );
      return;
    }

    // ── S-AIR Step 1: Standards Registry Health Check ──────────────────────
    const registryHealthy = await this.portContextService.isRegistryHealthy();
    if (!registryHealthy) {
      this.logger.warn(
        `Standards Registry is empty! Assessment for ${breach_case_id} will proceed ` +
          `without ILO clause grounding. Seed the registry via: npm run standards:seed`,
      );
      // We do NOT abort — AI still provides ISO guidance from its own knowledge.
      // But we publish a warning event so operators are aware.
      await this.outboxService.enqueue("erm.risk.standards-unavailable.v1", {
        breach_case_id,
        reason:
          "Port Context Registry is empty. ILO clause grounding unavailable.",
      });
    }

    // ── S-AIR Step 2: Retrieve ILO Port Context Clauses (Option B) ─────────
    const portClauses = await this.portContextService.getClausesForMetric(
      metric_name || "unknown",
    );
    this.logger.log(
      `Retrieved ${portClauses.length} ILO clause(s) for metric "${metric_name}"`,
    );

    try {
      // ── S-AIR Step 3: Gemini assessment with grounded ILO context ──────────
      const result = await this.geminiClient.assessRisk(
        {
          breach_case_id,
          metric_name: metric_name || "unknown",
          observed_value: observed_value ?? 0,
          threshold,
          severity,
          site_id: site_id || "unknown",
          bu_id,
          title,
        },
        portClauses,
      );

      const modelDisplayName = await this.resolveModelDisplayName(
        this.geminiClient.modelVersion,
      );

      // ── CRITICAL FIX: The Transactional Outbox (Atomic State) ────────────────
      // We wrap the Assessment, the Snapshot, and the Outbox Event in ONE atomic transaction.
      await this.prisma.$transaction(async (tx) => {
        // Step 4a: Persist AssessmentSuggestion
        const suggestion = await tx.assessmentSuggestion.create({
          data: {
            breach_case_id: String(breach_case_id),
            model_version: this.geminiClient.modelVersion,
            model_display_name: modelDisplayName,
            prompt_version: this.geminiClient.promptVersion,
            impact: result.impact,
            likelihood: result.likelihood,
            risk_score: result.risk_score,
            ilo_clause_applied: result.ilo_clause_applied,
            ilo_clause_title: result.ilo_clause_title,
            iso_clause_applied: result.iso_clause_applied,
            iso_clause_title: result.iso_clause_title,
            unable_to_cite_reason: result.unable_to_cite_reason,
            justification: result.justification,
            recommendations: result.recommendations,
            latency_ms: 0,
            status: "pending",
          },
        });

        // Step 4b: Persist StandardSnapshot (audit trail)
        await tx.standardSnapshot.create({
          data: {
            assessment_id: suggestion.id,
            ilo_clauses_used: portClauses.map((c) => c.clause_ref),
            iso_clauses_cited: result.iso_clause_applied
              ? [result.iso_clause_applied]
              : [],
            sources_version: "ILO_PORT_2018",
          },
        });

        // Step 5: Publish success event USING THE TRANSACTION CLIENT
        await this.outboxService.enqueueWithTx(
          tx,
          "erm.risk.assessment-created.v1",
          {
            assessment_id: suggestion.id,
            breach_case_id,
            impact: result.impact,
            likelihood: result.likelihood,
            risk_score: result.risk_score,
            ilo_clause_applied: result.ilo_clause_applied,
            iso_clause_applied: result.iso_clause_applied,
            model_version: this.geminiClient.modelVersion,
            model_display_name: modelDisplayName,
            prompt_version: this.geminiClient.promptVersion,
            is_ai: true,
          },
        );
      });

      assessmentPending.add(1);
      this.logger.log(`✅ AI assessment created for ${breach_case_id}`);
    } catch (err: any) {
      // ── IDEMPOTENCY FIX: Handle Concurrent Insert Collisions ───────────────
      if (err.code === "P2002") {
        this.logger.warn(
          `Concurrent execution detected. Assessment for ${breach_case_id} was already processed by another worker.`,
        );
        return; // Safely exit without failing
      }

      this.logger.error(
        `AI assessment failed for ${breach_case_id}: ${err.message}`,
      );
      assessmentFailed.add(1, {
        severity,
        site_id: site_id || "unknown",
        model: this.geminiClient.modelVersion,
        reason: err.message,
      });

      // ── THE DEAD LETTER TABLE: Transactional Failure Logging ───────────────
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.assessmentSuggestion.upsert({
            where: { breach_case_id: String(breach_case_id) },
            create: {
              breach_case_id: String(breach_case_id),
              model_version: this.geminiClient.modelVersion,
              model_display_name: await this.resolveModelDisplayName(
                this.geminiClient.modelVersion,
              ),
              prompt_version: this.geminiClient.promptVersion,
              impact: 0,
              likelihood: 0,
              risk_score: 0,
              justification:
                "AI assessment could not be generated due to system limits or an API error. Please review manually.",
              recommendations: ["Manual review required."],
              unable_to_cite_reason:
                "Assessment failed — no AI response received.",
              latency_ms: 0,
              status: "failed",
            },
            update: {},
          });

          await this.outboxService.enqueueWithTx(
            tx,
            "erm.risk.assessment-failed.v1",
            {
              breach_case_id,
              reason: err.message,
            },
          );
        });
      } catch (dbErr) {
        this.logger.error(
          `FATAL: Failed to write fallback record AND outbox event for ${breach_case_id}: ${dbErr.message}`,
        );
      }
    }
  }

  async getSuggestion(breachCaseId: string) {
    return this.prisma.assessmentSuggestion.findUnique({
      where: { breach_case_id: breachCaseId },
      include: { snapshot: true },
    });
  }

  async recordFeedback(
    id: string,
    status: "accepted" | "modified" | "rejected",
    humanFeedback?: string,
  ) {
    const suggestion = await this.prisma.assessmentSuggestion.update({
      where: { id },
      data: {
        status,
        human_feedback: humanFeedback || null,
      },
    });

    assessmentPending.add(-1);
    const attrs = { severity: "unknown" };
    if (status === "accepted") assessmentAccepted.add(1, attrs);
    else if (status === "modified") assessmentModified.add(1, attrs);
    else if (status === "rejected") assessmentRejected.add(1, attrs);

    await this.outboxService.enqueue("erm.risk.feedback-recorded.v1", {
      suggestion_id: id,
      breach_case_id: suggestion.breach_case_id,
      status,
      human_feedback: humanFeedback,
      recorded_at: new Date(),
    });

    this.logger.log(`Feedback recorded for assessment ${id}: ${status}`);
    return suggestion;
  }

  async getPendingCount() {
    return this.prisma.assessmentSuggestion.count({
      where: { status: "pending" },
    });
  }
}
