import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PrismaModule } from './prisma/prisma.module';
import { OutboxModule } from './outbox/outbox.module';
import { AuthModule } from './auth/auth.module';

import { envSchema } from './config/env.schema';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envSchema,
        }),
        PrismaModule,
        MonitoringModule,
        OutboxModule,
        AuthModule,
    ],
})
export class AppModule { }
