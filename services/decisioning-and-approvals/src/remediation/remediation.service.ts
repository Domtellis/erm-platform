import { Injectable, Logger, NotFoundException, Inject } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ClientKafka } from "@nestjs/microservices";
import {
  CreateRemediationPlanDto,
  RemediationStatus,
} from "./dto/create-remediation-plan.dto";

@Injectable()
export class RemediationService {
  private readonly logger = new Logger(RemediationService.name);

  constructor(
    private prisma: PrismaService,
    @Inject("KAFKA_SERVICE") private readonly kafkaClient: ClientKafka,
  ) {}

  async create(dto: CreateRemediationPlanDto) {
    this.logger.log(
      `Creating Remediation Plan for Risk Assessment: ${dto.risk_assessment_id}`,
    );

    const risk = await this.prisma.riskAssessment.findUnique({
      where: { id: dto.risk_assessment_id },
    });

    if (!risk) {
      throw new NotFoundException("Risk Assessment not found");
    }

    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.remediationPlan.create({
        data: {
          risk_assessment_id: dto.risk_assessment_id,
          title: dto.title,
          description: dto.description,
          assigned_to: dto.assigned_to,
          due_date: new Date(dto.due_date),
          status: RemediationStatus.OPEN,
        },
      });

      const eventPayload = {
        plan_id: plan.id,
        risk_assessment_id: plan.risk_assessment_id,
        title: plan.title,
        assigned_to: plan.assigned_to,
        due_date: plan.due_date,
      };

      // 1. Write to Outbox (for reliability/audit)
      await tx.outbox.create({
        data: {
          type: "erm.remediation.plan-created.v1",
          payload: eventPayload,
        },
      });

      // 2. Emit to Kafka (for immediate reaction)
      this.kafkaClient.emit("erm.remediation.plan-created.v1", {
        key: plan.id,
        value: { payload: eventPayload },
      });
      this.logger.log(
        `Emitted erm.remediation.plan-created.v1 for Plan ${plan.id}`,
      );

      return plan;
    });
  }

  async findAll(riskAssessmentId?: string) {
    if (riskAssessmentId) {
      return this.prisma.remediationPlan.findMany({
        where: { risk_assessment_id: riskAssessmentId },
        orderBy: { created_at: "desc" },
      });
    }
    return this.prisma.remediationPlan.findMany({
      orderBy: { created_at: "desc" },
    });
  }
}
