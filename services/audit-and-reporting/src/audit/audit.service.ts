import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Kafka, Consumer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuditService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(AuditService.name);
    private kafkaConsumer: Consumer;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        const kafka = new Kafka({
            clientId: 'audit-service-sink',
            brokers: [this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092')],
        });
        this.kafkaConsumer = kafka.consumer({ groupId: 'erm-audit-production-group-v2' });
    }

    async onModuleInit() {
        await this.kafkaConsumer.connect();
        await this.kafkaConsumer.subscribe({ topics: ['erm-audit-events', /^erm\..*/], fromBeginning: true });
        // Also subscribe to domain topics if needed, or use a pattern that matches both
        // For now, enforcing the shared topic pattern

        this.logger.log('Audit Sink Consumer connected and subscribed to: erm-audit-events');

        await this.kafkaConsumer.run({
            eachMessage: async ({ message }) => {
                try {
                    const event = JSON.parse(message.value.toString());
                    this.logger.log(`Sinking event to Audit Store: ${event.type} (${event.id})`);

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
                    this.logger.error('Error sinking audit event:', error);
                }
            },
        });
    }

    async onModuleDestroy() {
        await this.kafkaConsumer.disconnect();
    }
}
