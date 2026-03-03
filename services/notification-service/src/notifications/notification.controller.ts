import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { NotificationService } from "./notification.service";

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @EventPattern("erm.monitoring.breach-detected.v1")
  async handleBreachDetected(@Payload() message: any) {
    // KafkaJS delivers message.value as a Buffer. NestJS Microservices might or might not
    // parse it depending on the configuration. Adding robust handling.
    let event = message;
    if (message.value && Buffer.isBuffer(message.value)) {
      event = JSON.parse(message.value.toString());
    } else if (typeof message === 'string') {
      event = JSON.parse(message);
    }

    await this.notificationService.handleBreachDetected(event);
  }

  @EventPattern("erm.remediation.plan-created.v1")
  async handleRemediationPlanCreated(@Payload() message: any) {
    let event = message;
    if (message.value && Buffer.isBuffer(message.value)) {
      event = JSON.parse(message.value.toString());
    } else if (typeof message === 'string') {
      event = JSON.parse(message);
    }

    await this.notificationService.handleRemediationPlanCreated(event);
  }
}
