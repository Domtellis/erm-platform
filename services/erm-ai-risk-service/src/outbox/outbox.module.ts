import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CompressionTypes, CompressionCodecs } from 'kafkajs';
import { SnappyCodec } from 'kafkajs-snappy';
import { OutboxService } from './outbox.service';
import { PrismaModule } from '../prisma/prisma.module';

CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;

@Global()
@Module({
    imports: [
        PrismaModule,
        ClientsModule.register([
            {
                name: 'KAFKA_SERVICE',
                transport: Transport.KAFKA,
                options: {
                    client: {
                        clientId: 'ai-risk-service',
                        brokers: (process.env.KAFKA_BROKERS || 'redpanda:29092').split(','),
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
export class OutboxModule { }
