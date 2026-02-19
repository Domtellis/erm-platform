import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

async function generate() {
    const app = await NestFactory.create(AppModule, { logger: false });

    const config = new DocumentBuilder()
        .setTitle('Audit & Reporting API')
        .setDescription('The ERM Audit & Reporting domain service API')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    fs.writeFileSync('openapi.json', JSON.stringify(document, null, 2));
    await app.close();
}

generate();
