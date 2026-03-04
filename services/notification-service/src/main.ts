import "./instrumentation";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { getKafkaBrokers } from "./common/kafka.config";
import { KafkaJSNonRetriableError } from "kafkajs";
const { SnappyCodec } = require('kafkajs-snappy');

async function bootstrap() {
  // Register Snappy codec for KafkaJS
  try {
    const { Kafka } = require('kafkajs');
    const { setCompressionHierarchy } = require('kafkajs/src/protocol/message/compression');
    // Note: KafkaJS 2.x often requires manual registration for snappy
    require('kafkajs').CompressionCodecs[require('kafkajs').CompressionTypes.SNAPPY] = () => require('kafkajs-snappy');
  } catch (err) {
    console.error('Failed to register Snappy codec:', err);
  }

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Notification Service API")
    .setDescription("The ERM Notification domain service API")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // Kafka Consumer
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: getKafkaBrokers(),
      },
      consumer: {
        groupId: "erm-notification-group",
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 4020);
  console.log(
    `Notification Service is running on port ${process.env.PORT || 4020}`,
  );
}
bootstrap();
