import "./instrumentation";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Transport } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Configure Kafka Microservice (Hybrid App)
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: "audit-service-sink",
        brokers: [process.env.KAFKA_BROKERS || "redpanda:29092"],
      },
      consumer: {
        groupId: "erm-audit-production-group-v3",
      },
    },
  });

  const config = new DocumentBuilder()
    .setTitle("Audit & Reporting API")
    .setDescription("The ERM Audit & Reporting domain service API")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.startAllMicroservices();
  await app.listen(4013);
  console.log(`Audit Service is running on: http://localhost:4013`);
}
bootstrap();
