import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GeminiClient } from "./gemini.client";
import { OutboxService } from "../outbox/outbox.service";
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
  ) { }

  async onModuleInit() {
    // Initialize metrics to ensure they appear in Prometheus on startup
    const labels = { model: this.geminiClient.modelVersion };
    assessmentTotal.add(0, labels);
    assessmentFailed.add(0, labels);
    assessmentPending.add(0);
    this.logger.log("AI TRiSM Metrics initialized");
  }

  /**
   * Main entry point — called by the Kafka consumer when a breach is detected.
   * Generates an AI risk assessment and persists it. Never throws — failures are
   * logged and a failed event is published so the breach can still be processed manually.
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
      `Processing breach ${breach_case_id} for AI assessment | Type: ${typeof breach_case_id}`,
    );

    // Record initiation
    assessmentTotal.add(1, {
      severity,
      site_id: site_id || "unknown",
      model: this.geminiClient.modelVersion,
    });

    // Skip if we already have an assessment for this breach (idempotency)
    const existing = await this.prisma.assessmentSuggestion.findUnique({
      where: { breach_case_id: String(breach_case_id) },
    });
    if (existing) {
      this.logger.warn(
        `Assessment already exists for breach ${breach_case_id} — skipping`,
      );
      return;
    }

    try {
      const result = await this.geminiClient.assessRisk({
        breach_case_id,
        metric_name: metric_name || "unknown",
        observed_value: observed_value ?? 0,
        threshold,
        severity,
        site_id: site_id || "unknown",
        bu_id,
        title,
      });

      // Persist the assessment
      const suggestion = await this.prisma.assessmentSuggestion.create({
        data: {
          breach_case_id,
          model_version: this.geminiClient.modelVersion,
          prompt_version: this.geminiClient.promptVersion,
          impact: result.impact,
          likelihood: result.likelihood,
          risk_score: result.risk_score,
          justification: result.justification,
          recommendations: result.recommendations,
          latency_ms: 0, // latency is recorded in GeminiClient metrics
          status: "pending",
        },
      });

      // Record success telemetry
      assessmentPending.add(1);

      // Publish assessment-created event via outbox
      await this.outboxService.enqueue("erm.risk.assessment-created.v1", {
        assessment_id: suggestion.id,
        breach_case_id,
        impact: result.impact,
        likelihood: result.likelihood,
        risk_score: result.risk_score,
        model_version: this.geminiClient.modelVersion,
        prompt_version: this.geminiClient.promptVersion,
      });

      this.logger.log(
        `AI assessment created for breach ${breach_case_id} | ` +
        `impact=${result.impact} likelihood=${result.likelihood} risk_score=${result.risk_score}`,
      );
    } catch (err) {
      this.logger.error(
        `AI assessment failed for breach ${breach_case_id}: ${err.message}`,
      );
      assessmentFailed.add(1, {
        severity,
        site_id: site_id || "unknown",
        model: this.geminiClient.modelVersion,
        reason: err.message,
      });

      try {
        await this.prisma.assessmentSuggestion.upsert({
          where: { breach_case_id: String(breach_case_id) },
          create: {
            breach_case_id: String(breach_case_id),
            model_version: this.geminiClient.modelVersion,
            prompt_version: this.geminiClient.promptVersion,
            impact: 0,
            likelihood: 0,
            risk_score: 0,
            justification: "AI assessment could not be generated due to system limits or an API error. Please review manually.",
            recommendations: ["Manual review required."],
            latency_ms: 0,
            status: "failed",
          },
          update: {}, // Don't overwrite an existing successful record on Kafka re-delivery
        });
        this.logger.log(`Created 'failed' fallback assessment record for breach ${breach_case_id}`);
      } catch (dbErr) {
        this.logger.error(`Failed to write fallback assessment record for ${breach_case_id}: ${dbErr.message}`);
      }


      // Publish a failed event so downstream services know assessment is unavailable
      await this.outboxService
        .enqueue("erm.risk.assessment-failed.v1", {
          breach_case_id,
          reason: err.message,
        })
        .catch((outboxErr) => {
          this.logger.error(
            `Failed to enqueue assessment-failed event: ${outboxErr.message}`,
          );
        });
    }
  }

  /**
   * Fetch the AI suggestion for a given breach case.
   */
  async getSuggestion(breachCaseId: string) {
    return this.prisma.assessmentSuggestion.findUnique({
      where: { breach_case_id: breachCaseId },
    });
  }

  /**
   * Record human feedback (Accept / Modify / Reject) on an AI suggestion.
   */
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

    // Decrement pending backlog
    assessmentPending.add(-1);

    // Record acceptance/modification/rejection metric
    const attrs = { severity: "unknown" }; // severity not stored on suggestion; enrich if needed
    if (status === "accepted") assessmentAccepted.add(1, attrs);
    else if (status === "modified") assessmentModified.add(1, attrs);
    else if (status === "rejected") assessmentRejected.add(1, attrs);


    // Publish feedback event via outbox
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

  /**
   * Get the count of pending AI suggestions.
   */
  async getPendingCount() {
    return this.prisma.assessmentSuggestion.count({
      where: { status: "pending" },
    });
  }
}
