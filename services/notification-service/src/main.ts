import './instrumentation';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('Notification Service API')
        .setDescription('The ERM Notification domain service API')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Kafka Consumer
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: {
                brokers: (process.env.KAFKA_BROKERS || 'redpanda:29092').split(','),

            },
            consumer: {
                groupId: 'erm-notification-group',
            },
        },
    });

    await app.startAllMicroservices();
    await app.listen(process.env.PORT || 4020);
    console.log(`Notification Service is running on port ${process.env.PORT || 4020}`);
}
bootstrap();
