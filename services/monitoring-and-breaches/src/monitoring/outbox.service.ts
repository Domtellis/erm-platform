import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Kafka, Producer } from "kafkajs";
import { ConfigService } from "@nestjs/config";
import { getKafkaBrokers } from "../common/kafka.config";

@Injectable()
export class OutboxService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxService.name);
  private producer: Producer;
  private pollInterval: NodeJS.Timeout;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const kafka = new Kafka({
      clientId: "outbox-relay-monitoring",
      brokers: getKafkaBrokers(),
    });
    this.producer = kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log("Outbox Relay Producer connected to Kafka");

    // Start polling every 5 seconds
    this.pollInterval = setInterval(() => this.processOutbox(), 5000);
  }

  async onModuleDestroy() {
    clearInterval(this.pollInterval);
    await this.producer.disconnect();
  }

  private async processOutbox() {
    const pendingEvents = await this.prisma.outbox.findMany({
      where: { processed_at: null },
      take: 10,
    });

    if (pendingEvents.length === 0) return;

    this.logger.log(`Processing ${pendingEvents.length} outbox events`);

    for (const event of pendingEvents) {
      try {
        // Propagate Trace Context via Headers
        const headers = event.trace_context ? (event.trace_context as any) : {};

        await this.producer.send({
          topic: event.type,
          messages: [
            {
              value: JSON.stringify({
                id: event.id,
                type: event.type,
                source: "monitoring-service",
                time: event.occurred_at.toISOString(),
                data: event.payload,
              }),
              headers: headers, // Inject context here
            },
          ],
        });

        await this.prisma.outbox.update({
          where: { id: event.id },
          data: { processed_at: new Date() },
        });
      } catch (error) {
        this.logger.error(`Failed to process outbox event ${event.id}:`, error);
      }
    }
  }
}
