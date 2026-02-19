import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

async function generate() {
    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });

    const config = new DocumentBuilder()
        .setTitle('Monitoring & Breaches API')
        .setDescription('The ERM Monitoring & Breaches domain service API')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    fs.writeFileSync('openapi.json', JSON.stringify(document, null, 2));

    // We don't need to listen, just generate
    await app.close();
}

generate();
