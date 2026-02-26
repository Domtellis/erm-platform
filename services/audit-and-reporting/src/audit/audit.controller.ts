import { Controller, Get, UseGuards } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";

@ApiTags("Audit & Reporting")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("audit")
export class AuditController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getEvents() {
    return this.prisma.auditEvent.findMany({
      orderBy: { occurred_at: "desc" },
      take: 100,
    });
  }
}
