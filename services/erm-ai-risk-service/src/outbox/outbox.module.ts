import { Module, Global } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { CompressionTypes, CompressionCodecs } from "kafkajs";
import { SnappyCodec } from "kafkajs-snappy";
import { OutboxService } from "./outbox.service";
import { PrismaModule } from "../prisma/prisma.module";
import { getKafkaBrokers } from "../common/kafka.config";

CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;

@Global()
@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: "KAFKA_SERVICE",
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: "ai-risk-service",
            brokers: getKafkaBrokers(),
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  providers: [OutboxService],
  exports: [OutboxService],
})
export class OutboxModule {}
