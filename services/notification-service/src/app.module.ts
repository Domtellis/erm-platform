import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationController } from './notifications/notification.controller';
import { NotificationService } from './notifications/notification.service';
import { EmailService } from './notifications/email.service';
import { JiraService } from './notifications/jira.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ClientsModule.register([
            {
                name: 'KAFKA_SERVICE',
                transport: Transport.KAFKA,
                options: {
                    client: {
                        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
                    },
                    consumer: {
                        groupId: 'erm-notification-group',
                    },
                },
            },
        ]),
    ],
    controllers: [NotificationController],
    providers: [NotificationService, EmailService, JiraService],
})
export class AppModule { }
