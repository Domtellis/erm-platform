import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDecisionDto } from './dto/create-decision.dto';
import { ApproveDecisionDto } from './dto/approve-decision.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DecisioningService {
    private readonly logger = new Logger(DecisioningService.name);
    private opaUrl: string;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        this.opaUrl = this.configService.get<string>('OPA_URL', 'http://127.0.0.1:8181/v1/data/erm/governance');
    }

    async createDecision(dto: CreateDecisionDto) {
        this.logger.log(`Recording decision for case: ${dto.breach_case_id}`);
        return this.prisma.decision.create({
            data: {
                breach_case_id: dto.breach_case_id,
                decision_type: dto.decision_type,
                rationale: dto.rationale,
                submitted_by: dto.submitted_by,
                status: 'pending',
            },
        });
    }

    async approveDecision(id: string, dto: ApproveDecisionDto, user: any, authHeader: string) {
        const decision = await this.prisma.decision.findUnique({
            where: { id },
        });

        if (!decision) throw new NotFoundException('Decision not found');

        // Fetch Breach details to get Severity
        let severity = 'high'; // Default fail-safe
        try {
            // Using internal docker networking or localhost depending on environment
            // For local dev, we use localhost:4010
            const breachParam = await axios.get(`http://localhost:4010/breaches/${decision.breach_case_id}`, {
                headers: { Authorization: authHeader }
            });
            severity = breachParam.data?.severity || 'high';
            this.logger.log(`Resolved severity for case ${decision.breach_case_id}: ${severity}`);
        } catch (error) {
            this.logger.error(`Failed to fetch breach details: ${error.message}`);
            // If we can't fetch severity, we default to HIGH for safety
        }

        this.logger.log(`Performing OPA check: ${this.opaUrl}`);

        // Call OPA for Approval Authorization
        try {
            const opaResponse = await axios.post(this.opaUrl, {
                input: {
                    severity: severity,
                    submitted_by: decision.submitted_by,
                    approver_user_id: user?.userId || dto.approver_user_id, // Prefer token ID
                    approver_roles: user?.roles || [], // Use token roles
                },
            });

            this.logger.log(`OPA Response: ${JSON.stringify(opaResponse.data)}`);

            const allowed = opaResponse.data?.result?.allow;
            const sodCheck = opaResponse.data?.result?.sod_check;

            if (!allowed) {
                throw new ForbiddenException('Governance policy violation: Unauthorized approval');
            }

            // Determine effective role for persistence
            const userRoles = (user?.roles || []) as string[];
            let effectiveRole = dto.approver_role;

            if (severity === 'high' && userRoles.includes('bu_risk_owner')) {
                effectiveRole = 'bu_risk_owner';
            } else if (severity !== 'high' && userRoles.includes('risk_lead')) {
                effectiveRole = 'risk_lead';
            }
            if (!effectiveRole && userRoles.length > 0) effectiveRole = userRoles[0];

            const persistenceUserId = user?.userId || dto.approver_user_id;

            return this.prisma.$transaction(async (tx) => {
                // 1. Create Approval Record
                const approval = await tx.approval.create({
                    data: {
                        decision_id: id,
                        approver_user_id: persistenceUserId,
                        approver_role: effectiveRole,
                        status: 'approved',
                        sod_check_passed: sodCheck || false,
                    },
                });

                // 2. Update Decision Status
                await tx.decision.update({
                    where: { id },
                    data: { status: 'approved' }
                });

                // 3. Record the decision event in Outbox
                await tx.outbox.create({
                    data: {
                        type: 'erm.decisioning.decision-approved.v1',
                        payload: {
                            decision_id: id,
                            approver_user_id: persistenceUserId,
                            approver_role: effectiveRole,
                            approved_at: approval.approved_at,
                        },
                    },
                });

                return approval;
            });
        } catch (error) {
            if (error instanceof ForbiddenException) throw error;
            this.logger.error(`OPA Connection Error Details: ${error.message}`);
            if (error.response) {
                this.logger.error(`OPA Status: ${error.response.status}`);
                this.logger.error(`OPA Body: ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(`Governance service error: ${error.message}`);
        }
    }

    async findAll(breachCaseId?: string) {
        const where = breachCaseId ? { breach_case_id: breachCaseId } : {};
        return this.prisma.decision.findMany({
            where,
            include: { approvals: true },
            orderBy: { created_at: 'desc' },
        });
    }
}
