import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Kafka, Producer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OutboxService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(OutboxService.name);
    private kafkaProducer: Producer;
    private relayTimer: NodeJS.Timeout;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        const kafka = new Kafka({
            clientId: 'monitoring-outbox-relay',
            brokers: [this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092')],
        });
        this.kafkaProducer = kafka.producer();
    }

    async onModuleInit() {
        await this.kafkaProducer.connect();
        this.logger.log('Kafka Producer connected for Outbox Relay');

        // Start polling the outbox table every 5 seconds
        this.relayTimer = setInterval(() => this.relayEvents(), 5000);
    }

    async onModuleDestroy() {
        clearInterval(this.relayTimer);
        await this.kafkaProducer.disconnect();
    }

    private async relayEvents() {
        try {
            const pendingEvents = await this.prisma.outbox.findMany({
                where: { processed_at: null },
                take: 10,
                orderBy: { occurred_at: 'asc' },
            });

            if (pendingEvents.length === 0) return;

            this.logger.log(`Relaying ${pendingEvents.length} events to Kafka...`);

            for (const event of pendingEvents) {
                await this.kafkaProducer.send({
                    topic: 'erm-audit-events', // Default topic for PoPath
                    messages: [
                        {
                            key: event.id,
                            value: JSON.stringify({
                                id: event.id,
                                time: event.occurred_at,
                                type: event.type,
                                data: event.payload,
                                source: '/services/monitoring-and-breaches',
                                specversion: '1.0',
                            }),
                        },
                    ],
                });

                // Mark as processed in the same DB context
                await this.prisma.outbox.update({
                    where: { id: event.id },
                    data: { processed_at: new Date() },
                });
            }
        } catch (error) {
            this.logger.error('Error in Outbox Relay:', error);
        }
    }
}
