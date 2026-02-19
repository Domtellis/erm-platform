import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { JiraService } from './jira.service';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        private readonly emailService: EmailService,
        private readonly jiraService: JiraService,
    ) { }

    async handleBreachDetected(event: any) {
        let { payload } = event;
        // Handle monitoring-service format where payload is in 'data'
        if (!payload && event.data) {
            payload = event.data;
        }

        const severity = (payload?.severity || 'low').toLowerCase();

        this.logger.log(`Processing Breach: ${payload?.title} (${severity})`);

        if (severity === 'high' || severity === 'critical') {
            this.logger.log('High/Critical Severity Detected. Sending Email Alert...');
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
            await this.emailService.sendAlert('risk-lead-01@example.com', subject, body);
        }
    }

    async handleRemediationPlanCreated(event: any) {
        let { payload } = event;
        // Fallback if payload is not wrapped (backward compatibility or direct objects)
        if (!payload && event.title) {
            payload = event;
        }

        if (!payload || !payload.title) {
            this.logger.warn(`Invalid remediation event received: ${JSON.stringify(event)}`);
            return;
        }

        this.logger.log(`Processing Remediation Plan: ${payload.title}`);
        await this.jiraService.createIssue(payload);
    }
}
