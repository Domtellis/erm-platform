import { Injectable, Logger } from "@nestjs/common";
import { EmailService } from "./email.service";
import { JiraService } from "./jira.service";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly jiraService: JiraService,
  ) { }

  async handleBreachDetected(event: any) {
    // The controller already unwrapped this, so 'event' is the actual payload
    const payload = event;

    const severity = (payload?.severity || "low").toLowerCase();

    this.logger.log(`Processing Breach: ${payload?.title} (${severity})`);

    if (severity === "critical" || severity === "high" || severity === "medium") {
      this.logger.log(
        `[TRACE] Severity '${severity}' matches threshold. Sending Email...`,
      );
      const subject = `[ERM] ${severity.toUpperCase()} Breach Detected: ${payload.title}`;
      const body = `
Risk Compliance Alert
---------------------
Severity: ${severity.toUpperCase()}
Title: ${payload.title}
Detected At: ${payload.detected_at}
Business Unit: ${payload.bu_id}
Breach Case ID: ${payload.breach_case_id}

Action Required: Please log in to the ERM Portal to assess this breach immediately.
            `;
      // In a real app, recipient would be configured or looked up based on BU
      await this.emailService.sendAlert(
        "risk-lead-01@example.com",
        subject,
        body,
      );
    } else {
      this.logger.log(`[TRACE] Severity '${severity}' skipped (low)`);
    }
  }

  async handleRemediationPlanCreated(event: any) {
    // The controller already unwrapped this, so 'event' is the actual payload
    const payload = event;

    if (!payload || !payload.title) {
      this.logger.warn(
        `Invalid remediation event received: ${JSON.stringify(event)}`,
      );
      return;
    }

    this.logger.log(`Processing Remediation Plan: ${payload.title}`);
    try {
      await this.jiraService.createIssue(payload);
    } catch (err) {
      this.logger.error(`Critical failure in JiraService: ${err.message}`);
    }
  }
}
