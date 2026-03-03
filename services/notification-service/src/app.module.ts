import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { NotificationController } from "./notifications/notification.controller";
import { NotificationService } from "./notifications/notification.service";
import { EmailService } from "./notifications/email.service";
import { JiraService } from "./notifications/jira.service";
import { getKafkaBrokers } from "./common/kafka.config";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: "KAFKA_SERVICE",
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: getKafkaBrokers(),
          },
          consumer: {
            groupId: "erm-notification-client",
          },
        },
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, EmailService, JiraService],
})
export class AppModule { }
