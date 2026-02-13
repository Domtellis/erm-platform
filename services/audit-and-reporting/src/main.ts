import './instrumentation';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.listen(4013);
    console.log(`Audit Service is running on: http://localhost:4013`);
}
bootstrap();
