import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBreachSubmissionDto } from './dto/create-breach-submission.dto';
import { trace, context, propagation } from '@opentelemetry/api';

@Injectable()
export class MonitoringService {
    private readonly logger = new Logger(MonitoringService.name);

    constructor(private prisma: PrismaService) { }

    async submitBreach(dto: CreateBreachSubmissionDto) {
        this.logger.log(`Processing breach submission: ${dto.title}`);

        // Capture Trace Context
        const activeContext = context.active();
        const carrier = {};
        propagation.inject(activeContext, carrier);

        // Transactional persistence: Case + Outbox Event
        return this.prisma.$transaction(async (tx) => {
            // 1. Create the Breach Case
            const breachCase = await tx.breachCase.create({
                data: {
                    title: dto.title || `Breach: ${dto.metric_name} @ ${dto.site_id}`,
                    site_id: dto.site_id,
                    metric_name: dto.metric_name,
                    observed_value: dto.observed_value,
                    bu_id: dto.bu_id,
                    severity: dto.severity || 'unknown',
                    status: 'open',
                },
            });

            // 2. Create the Outbox Event
            await tx.outbox.create({
                data: {
                    type: 'erm.monitoring.breach-detected.v1',
                    payload: {
                        breach_case_id: breachCase.id,
                        bu_id: breachCase.bu_id,
                        category: dto.category,
                        severity: breachCase.severity,
                        title: breachCase.title,
                        detected_at: breachCase.created_at,
                    },
                    trace_context: carrier as any, // Save trace context
                },
            });

            return breachCase;
        });
    }

    async findAll() {
        return this.prisma.breachCase.findMany({
            orderBy: { created_at: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.breachCase.findUnique({
            where: { id },
            include: { evaluations: true },
        });
    }
}
