import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { RemediationService } from "./remediation.service";
import { RemediationController } from "./remediation.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { getKafkaBrokers } from "../common/kafka.config";

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: "KAFKA_SERVICE",
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: getKafkaBrokers(),
          },
          consumer: {
            groupId: "erm-decisioning-producer",
          },
        },
      },
    ]),
  ],
  controllers: [RemediationController],
  providers: [RemediationService],
  exports: [RemediationService],
})
export class RemediationModule {}
