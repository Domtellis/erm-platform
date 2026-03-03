import "./instrumentation";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";
import { getKafkaBrokers } from "./common/kafka.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: getKafkaBrokers(),
      },
      consumer: {
        groupId: "monitoring-consumer",
      },
    },
  });

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle("Monitoring & Breaches API")
    .setDescription("The ERM Monitoring & Breaches domain service API")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.startAllMicroservices();
  await app.listen(4010);
  console.log(`Monitoring Service is running on: http://localhost:4010`);
}
bootstrap();
