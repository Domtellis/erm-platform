import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBreachSubmissionDto } from "./dto/create-breach-submission.dto";
import { context, propagation } from "@opentelemetry/api";

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(private prisma: PrismaService) { }

  async submitBreach(dto: CreateBreachSubmissionDto) {
    this.logger.log(`Processing breach submission: ${dto.title}`);

    // Capture Trace Context
    const activeContext = context.active();
    const carrier = {};
    propagation.inject(activeContext, carrier);

    // Calculate SLAs
    const severity = dto.severity?.toLowerCase() || "low"; // Default to low if unknown
    const slas = this.calculateSLADeadlines(severity);

    // Transactional persistence: Case + Outbox Event
    return this.prisma.$transaction(async (tx) => {
      // 1. Create the Breach Case
      const breachCase = await tx.breachCase.create({
        data: {
          title: dto.title || `Breach: ${dto.metric_name} @ ${dto.site_id}`,
          site_id: dto.site_id,
          metric_name: dto.metric_name,
          observed_value: dto.observed_value,
          bu_id: dto.bu_id,
          severity: dto.severity || "unknown",
          status: "open",
          ...slas, // Inject calculated deadlines
        },
      });

      // 2. Create the Outbox Event
      await tx.outbox.create({
        data: {
          type: "erm.monitoring.breach-detected.v1",
          payload: {
            breach_case_id: breachCase.id,
            bu_id: breachCase.bu_id,
            category: dto.category,
            severity: breachCase.severity,
            title: breachCase.title,
            site_id: breachCase.site_id,
            metric_name: breachCase.metric_name,
            observed_value: breachCase.observed_value,
            threshold: dto.threshold, // Original threshold from DTO
            detected_at: breachCase.created_at,
            triage_due_at: breachCase.triage_due_at,
          },
          trace_context: carrier as any, // Save trace context
        },
      });

      return breachCase;
    });
  }

  private calculateSLADeadlines(severity: string) {
    const now = new Date();
    const addMinutes = (date: Date, minutes: number) =>
      new Date(date.getTime() + minutes * 60000);

    // SLA Config (from slas.yaml)
    const slaConfig = {
      high: { triage: 60, decision: 480, closure: 10080 }, // 1h, 8h, 7d
      medium: { triage: 180, decision: 1440, closure: 20160 }, // 3h, 24h, 14d
      low: { triage: 480, decision: 2880, closure: 43200 }, // 8h, 48h, 30d
    };

    const config = slaConfig[severity] || slaConfig["low"]; // Fallback to Low

    return {
      triage_due_at: addMinutes(now, config.triage),
      decision_due_at: addMinutes(now, config.decision),
      closure_due_at: addMinutes(now, config.closure),
    };
  }

  async findAll() {
    return this.prisma.breachCase.findMany({
      orderBy: { created_at: "desc" },
    });
  }

  async findOne(id: string) {
    return this.prisma.breachCase.findUnique({
      where: { id },
      include: { evaluations: true },
    });
  }

  async getMetrics() {
    const totalActive = await this.prisma.breachCase.count({
      where: { status: "open" },
    });

    const criticalActive = await this.prisma.breachCase.count({
      where: {
        status: "open",
        severity: "critical",
      },
    });

    // "Safety Appetite" Compliance = (1 - (Critical / Total)) * 100
    // If 0 breaches, we are 100% compliant.
    let compliance = 100;

    if (totalActive > 0) {
      const ratio = criticalActive / totalActive;
      compliance = Math.round((1 - ratio) * 100);
    }

    return {
      total_active_breaches: totalActive,
      critical_active_breaches: criticalActive,
      appetite_compliance_score: compliance,
    };
  }

  async closeBreach(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const breach = await tx.breachCase.update({
        where: { id },
        data: {
          status: "closed",
          closed_at: now,
        },
      });

      await tx.outbox.create({
        data: {
          type: "erm.monitoring.breach-closed.v1",
          payload: {
            breach_case_id: id,
            closed_at: now,
          },
        },
      });

      return breach;
    });
  }

  async handleDecisionApproved(payload: any) {
    const eventData = payload.data || payload;
    this.logger.log(
      `Received Decision Approved event for decision ${eventData.decision_id}`,
    );
    const { breach_case_id } = eventData;

    if (!breach_case_id) {
      this.logger.warn(
        `Missing breach_case_id in payload: ${JSON.stringify(payload)}`,
      );
      return;
    }

    try {
      await this.prisma.breachCase.update({
        where: { id: breach_case_id },
        data: {
          status: "decision_approved",
          decision_approved_at: new Date(),
        },
      });
      this.logger.log(
        `Updated breach ${breach_case_id} status to decision_approved`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update breach status for ${breach_case_id}: ${error.message}`,
      );
    }
  }

  async handleRiskAssessmentCreated(payload: any) {
    const eventData = payload.data || payload;
    this.logger.log(
      `Received Risk Assessment Created event for assessment ${eventData.assessment_id}`,
    );
    const { breach_case_id } = eventData;

    if (!breach_case_id) {
      this.logger.warn(
        `Missing breach_case_id in payload: ${JSON.stringify(payload)}`,
      );
      return;
    }

    try {
      await this.prisma.breachCase.update({
        where: { id: breach_case_id },
        data: {
          status: "triaged",
          triage_completed_at: new Date(),
        },
      });
      this.logger.log(`Updated breach ${breach_case_id} status to triaged`);
    } catch (error) {
      this.logger.error(
        `Failed to update breach status for ${breach_case_id}: ${error.message}`,
      );
    }
  }
}
