import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ClientKafka } from "@nestjs/microservices";
import { Inject } from "@nestjs/common";
import { kafkaPublishedCount } from "../instrumentation";

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
   * To be used within a Prisma transaction.
   */
  async enqueue(type: string, payload: any, tx?: any) {
    const prisma = tx || this.prisma;
    return prisma.outbox.create({
      data: {
        type,
        payload,
      },
    });
  }

  /**
   * Background worker (simplified for POC) that periodically checks for
   * unprocessed outbox messages and publishes them to Kafka.
   * In production, this would be a separate worker or a Debezium connector.
   */
  async processOutbox() {
    const pending = await this.prisma.outbox.findMany({
      where: { processed_at: null },
      take: 10,
    });

    for (const message of pending) {
      try {
        await this.kafkaClient.emit(message.type, message.payload).toPromise();

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
