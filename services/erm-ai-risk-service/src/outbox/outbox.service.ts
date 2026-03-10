import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { ClientKafka } from "@nestjs/microservices";
import { Inject } from "@nestjs/common";
import { kafkaPublishedCount } from "../instrumentation";
import { Prisma } from "@prisma/client/ai-risk";

@Injectable()
export class OutboxService implements OnModuleInit {
  private readonly logger = new Logger(OutboxService.name);

  constructor(
    private prisma: PrismaService,
    @Inject("KAFKA_SERVICE") private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  /**
   * Enqueue an event to be published via the Outbox pattern.
   * Can be used with or without an existing Prisma transaction.
   */
  async enqueue(type: string, payload: any, tx?: Prisma.TransactionClient) {
    const prismaClient = tx || this.prisma;
    return prismaClient.outbox.create({
      data: {
        type,
        payload,
      },
    });
  }

  /**
   * Alias for enqueue when a transaction client is explicitly required.
   */
  async enqueueWithTx(
    tx: Prisma.TransactionClient,
    type: string,
    payload: any,
  ) {
    return this.enqueue(type, payload, tx);
  }

  /**
   * Background worker (simplified for POC) that periodically checks for
   * unprocessed outbox messages and publishes them to Kafka.
   * In production, this would be a separate worker or a Debezium connector.
   */
  @Cron(CronExpression.EVERY_5_SECONDS)
  async processOutbox() {
    const pending = await this.prisma.outbox.findMany({
      where: { processed_at: null },
      take: 10,
    });

    for (const message of pending) {
      try {
        // Wrap the payload in a CloudEvent structure expected by the Audit Service
        const cloudEvent = {
          id: message.id,
          time: message.occurred_at,
          type: message.type,
          data: message.payload,
          source: "/services/erm-ai-risk-service",
          specversion: "1.0",
        };

        // NestJS ClientKafka emit requires a key/value payload for non-JSON serialization sometimes,
        // but since pattern is topic, we just send the structured object
        await this.kafkaClient.emit(message.type, cloudEvent).toPromise();

        await this.prisma.outbox.update({
          where: { id: message.id },
          data: { processed_at: new Date() },
        });

        kafkaPublishedCount.add(1, { topic: message.type, status: "success" });
        this.logger.log(
          `Published outbox event: ${message.type} (id: ${message.id})`,
        );
      } catch (err) {
        this.logger.error(
          `Failed to publish outbox event ${message.id}: ${err.message}`,
        );
        kafkaPublishedCount.add(1, { topic: message.type, status: "error" });
      }
    }
  }
}
