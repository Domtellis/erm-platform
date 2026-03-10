import { Controller, Get, UseGuards, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "./audit.service";
import { EventPattern, Payload } from "@nestjs/microservices";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";

@ApiTags("Audit & Reporting")
@Controller("audit")
export class AuditController {
  private readonly logger = new Logger(AuditController.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  @EventPattern([
    "erm.monitoring.breach-detected.v1",
    "erm.monitoring.breach-closed.v1",
    "erm.risk.assessment-created.v1",
    "erm.risk.assessment-failed.v1",
    "erm.risk.feedback-recorded.v1",
    "erm.decisioning.decision-approved.v1",
    "erm.remediation.plan-created.v1",
  ])
  async handleAuditEvents(@Payload() data: any) {
    this.logger.log(`Received event for auditing: ${data.type}`);
    // NestJS Microservices wrap the payload; extract 'data' if nested by Outbox
    const event = data.value || data;
    await this.auditService.handleEvent(event);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Get()
  async getEvents() {
    return this.prisma.auditEvent.findMany({
      orderBy: { occurred_at: "desc" },
      take: 100,
    });
  }

  @Get("health")
  async health() {
    return { status: "ok", service: "audit-and-reporting" };
  }

  @Get("version")
  async version() {
    return { version: "1.1.0-fix" };
  }
}
