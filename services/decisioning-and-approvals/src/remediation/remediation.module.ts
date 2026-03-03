import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { RemediationService } from "./remediation.service";
import { RemediationController } from "./remediation.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: "KAFKA_SERVICE",
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: (process.env.KAFKA_BROKERS || "redpanda:29092").split(","),
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
export class RemediationModule { }
