import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async handleEvent(event: any) {
    try {
      this.logger.log(
        `Sinking event to Audit Store: ${event.type} (${event.id})`,
      );

      await this.prisma.auditEvent.create({
        data: {
          event_id: event.id,
          type: event.type,
          source: event.source,
          payload: event.data,
          occurred_at: new Date(event.time),
        },
      });
    } catch (error) {
      this.logger.error("Error sinking audit event:", error);
    }
  }
}
