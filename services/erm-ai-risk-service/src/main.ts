import "./instrumentation";
import { CompressionTypes, CompressionCodecs } from "kafkajs";
import { SnappyCodec } from "kafkajs-snappy";

CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Kafka consumer — listens for breach-detected events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: (process.env.KAFKA_BROKERS || "redpanda:29092").split(","),
      },
      consumer: {
        groupId: "ai-risk-consumer",
      },
    },
  });

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle("ERM AI Risk Assessment API")
    .setDescription(
      "AI-powered ISO 45001 risk assessment service using Gemini 2.0 Flash",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 4014);
  console.log(
    `AI Risk Service is running on: http://localhost:${process.env.PORT || 4014}`,
  );
}
bootstrap();
