import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRiskAssessmentDto } from "./dto/create-risk-assessment.dto";

@Injectable()
export class RiskService {
  private readonly logger = new Logger(RiskService.name);

  constructor(private prisma: PrismaService) {}

  async createAssessment(dto: CreateRiskAssessmentDto) {
    // Calculate Risk Level Matrix
    // Score = Impact * Likelihood
    // 1-5: Low
    // 6-10: Medium
    // 12-16: High
    // 20-25: Critical

    const score = dto.impact_score * dto.likelihood_score;
    let riskLevel = "Low";

    if (score >= 20) riskLevel = "Critical";
    else if (score >= 12) riskLevel = "High";
    else if (score >= 6) riskLevel = "Medium";

    this.logger.log(
      `Creating assessment for Breach ${dto.breach_case_id}. Score: ${score} -> ${riskLevel}`,
    );

    return this.prisma.$transaction(async (tx) => {
      const assessment = await tx.riskAssessment.create({
        data: {
          breach_case_id: dto.breach_case_id,
          title: dto.title,
          summary: dto.summary,
          impact_score: dto.impact_score,
          likelihood_score: dto.likelihood_score,
          risk_level: riskLevel,
          assessed_by: dto.submitted_by,
        },
      });

      await tx.outbox.create({
        data: {
          type: "erm.risk.assessment-created.v1",
          payload: {
            assessment_id: assessment.id,
            breach_case_id: assessment.breach_case_id,
            risk_level: assessment.risk_level,
            score: score,
            assessed_by: assessment.assessed_by,
          },
        },
      });

      return assessment;
    });
  }

  async findAll(breachCaseId?: string) {
    if (breachCaseId) {
      return this.prisma.riskAssessment.findMany({
        where: { breach_case_id: breachCaseId },
        orderBy: { created_at: "desc" },
      });
    }
    return this.prisma.riskAssessment.findMany({
      orderBy: { created_at: "desc" },
    });
  }
}
