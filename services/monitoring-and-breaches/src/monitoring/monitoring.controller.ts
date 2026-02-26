import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { MonitoringService } from "./monitoring.service";
import { CreateBreachSubmissionDto } from "./dto/create-breach-submission.dto";
import { AuthGuard } from "@nestjs/passport";
import { EventPattern, Payload } from "@nestjs/microservices";

@ApiTags("Monitoring & Breaches")
@ApiBearerAuth()
@Controller("breaches")
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Post("manual-submission")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Manually submit a breach signal/case" })
  async create(@Body() dto: CreateBreachSubmissionDto, @Request() req) {
    const userRoles = req.user?.roles || [];
    if (!userRoles.includes("site_manager")) {
      throw new ForbiddenException("Only Site Managers can submit breaches");
    }
    return this.monitoringService.submitBreach(dto);
  }

  @Get("metrics")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Get current breach metrics and compliance" })
  async getMetrics() {
    return this.monitoringService.getMetrics();
  }

  @Get()
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "List all breach cases" })
  async findAll() {
    return this.monitoringService.findAll();
  }

  @Get(":id")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Get details for a specific breach case" })
  async findOne(@Param("id") id: string) {
    return this.monitoringService.findOne(id);
  }

  @Post(":id/close")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Close a breach case" })
  async close(@Param("id") id: string) {
    return this.monitoringService.closeBreach(id);
  }

  @EventPattern("erm.decisioning.decision-approved.v1")
  async handleDecisionApproved(@Payload() message: any) {
    await this.monitoringService.handleDecisionApproved(message);
  }

  @EventPattern("erm.risk.assessment-created.v1")
  async handleRiskAssessmentCreated(@Payload() message: any) {
    await this.monitoringService.handleRiskAssessmentCreated(message);
  }
}
