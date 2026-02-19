import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DecisioningModule } from './decisioning/decisioning.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RiskModule } from './risk/risk.module';
import { RemediationModule } from './remediation/remediation.module';

import { envSchema } from './config/env.schema';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envSchema,
        }),
        PrismaModule,
        DecisioningModule,
        RiskModule,
        RemediationModule,
        AuthModule,
    ],
})
export class AppModule { }
