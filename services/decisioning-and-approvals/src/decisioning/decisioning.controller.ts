import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { DecisioningService } from "./decisioning.service";
import { CreateDecisionDto } from "./dto/create-decision.dto";
import { ApproveDecisionDto } from "./dto/approve-decision.dto";
import { AuthGuard } from "@nestjs/passport";

@ApiTags("Decisioning & Approvals")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("decisions")
export class DecisioningController {
  constructor(private readonly decisioningService: DecisioningService) {}

  @Post()
  @ApiOperation({ summary: "Submit a response decision" })
  async create(@Body() dto: CreateDecisionDto) {
    return this.decisioningService.createDecision(dto);
  }

  @Post(":id/approve")
  @ApiOperation({ summary: "Approve a response decision" })
  async approve(
    @Param("id") id: string,
    @Body() dto: ApproveDecisionDto,
    @Request() req,
  ) {
    return this.decisioningService.approveDecision(
      id,
      dto,
      req.user,
      req.headers.authorization,
    );
  }

  @Get()
  @ApiOperation({ summary: "List all decisions" })
  async findAll(@Query("breach_case_id") breachCaseId?: string) {
    return this.decisioningService.findAll(breachCaseId);
  }
}
