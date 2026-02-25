import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { NotificationService } from "./notification.service";

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern("erm.monitoring.breach-detected.v1")
  async handleBreachDetected(@Payload() message: any) {
    // KafkaJS implementation details specific: message.value might be the payload
    // Validation: verify message structure
    // NestJS Kafka transport often unwraps value, but let's be safe
    const event = message.value ? message.value : message;
    await this.notificationService.handleBreachDetected(event);
  }

  @EventPattern("erm.remediation.plan-created.v1")
  async handleRemediationPlanCreated(@Payload() message: any) {
    const event = message.value ? message.value : message;
    await this.notificationService.handleRemediationPlanCreated(event);
  }
}
