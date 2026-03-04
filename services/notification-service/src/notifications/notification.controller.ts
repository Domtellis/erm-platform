import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { NotificationService } from "./notification.service";

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) { }

  @EventPattern("erm.monitoring.breach-detected.v1")
  async handleBreachDetected(@Payload() message: any) {
    // Surgical Diagnostic Logs
    this.logger.log(`[TRACE] Inbound Type: ${Buffer.isBuffer(message) ? 'Buffer' : typeof message}`);
    this.logger.log(`[TRACE] Raw Snippet: ${JSON.stringify(message).substring(0, 50)}...`);

    let event = message;

    // Robust parsing for KafkaJS/NestJS microservice payloads
    try {
      if (Buffer.isBuffer(message)) {
        event = JSON.parse(message.toString());
      } else if (message.value && Buffer.isBuffer(message.value)) {
        event = JSON.parse(message.value.toString());
      } else if (typeof message === 'string') {
        event = JSON.parse(message);
      }

      // Hardening: If 'event' is STILL a string after first parse (double-stringified)
      if (typeof event === 'string') {
        try {
          event = JSON.parse(event);
          this.logger.log(`[TRACE] Double-stringified payload detected and resolved.`);
        } catch (e) {
          // Not JSON, keep as string
        }
      }

      // Handle nesting: NestJS wraps in 'value' or monitoring sends in 'data'
      const finalEvent = event.value || event.data || event;
      this.logger.log(`[TRACE] Parsed Event Keys: ${Object.keys(finalEvent || {}).join(', ')}`);

      await this.notificationService.handleBreachDetected(finalEvent);
    } catch (err) {
      this.logger.error(`[TRACE ERROR] Breach parsing failed: ${err.message}`);
    }
  }

  @EventPattern("erm.remediation.plan-created.v1")
  async handleRemediationPlanCreated(@Payload() message: any) {
    let event = message;

    try {
      if (Buffer.isBuffer(message)) {
        event = JSON.parse(message.toString());
      } else if (message.value && Buffer.isBuffer(message.value)) {
        event = JSON.parse(message.value.toString());
      } else if (typeof message === 'string') {
        event = JSON.parse(message);
      }

      const finalEvent = event.value || event.data || event;
      await this.notificationService.handleRemediationPlanCreated(finalEvent);
    } catch (err) {
      this.logger.error(`Failed to parse remediation - plan - created event: ${err.message} `);
    }
  }
}
