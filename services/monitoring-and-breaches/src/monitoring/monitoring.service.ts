import { Injectable, Logger, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBreachSubmissionDto } from "./dto/create-breach-submission.dto";
import { context, propagation } from "@opentelemetry/api";

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(private prisma: PrismaService) { }

  async submitBreach(dto: CreateBreachSubmissionDto) {
    this.logger.log(`Processing breach submission: ${dto.metric_name} with value ${dto.observed_value}`);

    // Capture Trace Context
    const activeContext = context.active();
    const carrier = {};
    propagation.inject(activeContext, carrier);

    // Calculate Severity based on Appetite Thresholds (Automatic Escalation)
    const evaluatedSeverity = await this.evaluateSeverity(dto.metric_name, dto.observed_value, dto.category);

    // Override user-provided severity if automatic evaluation succeeded
    const finalSeverity = evaluatedSeverity !== 'none' ? evaluatedSeverity : (dto.severity?.toLowerCase() || "low");
    const slas = this.calculateSLADeadlines(finalSeverity);

    this.logger.log(`Breach ${dto.metric_name} evaluated as severity: ${finalSeverity}`);

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
          severity: finalSeverity,
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

  /**
   * Evaluates the severity of a breach by querying the current appetite thresholds.
   * This ensures that zero-tolerance metrics are always correctly escalated.
   */
  private async evaluateSeverity(metricName: string, observedValue: number, category: string): Promise<string> {
    const appetiteUrl = process.env.APPETITE_SERVICE_URL || 'http://appetite-service:4012';
    try {
      this.logger.log(`Querying appetite-service for ${metricName} thresholds...`);
      const response = await fetch(`${appetiteUrl}/appetites/current?category=${category}`);

      if (!response.ok) {
        this.logger.warn(`Could not fetch thresholds from appetite-service: ${response.statusText}`);
        return 'none';
      }

      const appetite: any = await response.json();
      if (!appetite || !appetite.thresholds) return 'none';

      const threshold = appetite.thresholds.find(t => t.metric_name === metricName);
      if (!threshold) {
        this.logger.warn(`No threshold mapping found for metric: ${metricName}`);
        return 'none';
      }

      // 1. Check if the value constitutes a breach
      const isBreach = threshold.operator === '>'
        ? observedValue > threshold.limit_value
        : observedValue < threshold.limit_value;

      if (!isBreach) return 'low'; // It's a signal but technically within appetite

      // 2. Map Severity using the multi-tier mapping from the database
      // Mapping format: { "0": "high", "0.5": "low", "1.0": "high" }
      const mappings = threshold.severity_mapping || {};
      const sortedKeys = Object.keys(mappings)
        .map(Number)
        .sort((a, b) => {
          // For 'greater-than', high values are worse (descending)
          // For 'less-than', low values are worse (ascending)
          return threshold.operator === '>' ? b - a : a - b;
        });

      for (const triggerValue of sortedKeys) {
        if (threshold.operator === '>') {
          if (observedValue >= triggerValue) return mappings[triggerValue.toString()];
        } else if (threshold.operator === '<') {
          if (observedValue <= triggerValue) return mappings[triggerValue.toString()];
        }
      }

      return 'low'; // Default breach fallback
    } catch (error) {
      this.logger.error(`Automatic severity evaluation failed: ${error.message}`);
      return 'none'; // Fallback to user-provided or default
    }
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
      const breach = await tx.breachCase.findUnique({ where: { id } });
      if (!breach) throw new ForbiddenException("Breach case not found");

      // Mandate human sign-off before closure
      if (breach.status !== "decision_approved") {
        this.logger.warn(`Rejected closure attempt for breach ${id}: Status is ${breach.status}, expected decision_approved`);
        throw new ForbiddenException("Governance Guardrail: Human certification (Decision Approved) is required before a case can be closed.");
      }

      const now = new Date();
      const updatedBreach = await tx.breachCase.update({
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

      return updatedBreach;
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
      const isAi = eventData.is_ai ?? true; // Default to true for backward compatibility
      const newStatus = isAi ? "ai_suggested" : "triaged";

      await this.prisma.breachCase.update({
        where: { id: breach_case_id },
        data: {
          status: newStatus,
          triage_completed_at: new Date(),
        },
      });
      this.logger.log(`Updated breach ${breach_case_id} status to ${newStatus}`);
    } catch (error) {
      this.logger.error(
        `Failed to update breach status for ${breach_case_id}: ${error.message}`,
      );
    }
  }
}
