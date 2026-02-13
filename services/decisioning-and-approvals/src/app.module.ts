import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DecisioningModule } from './decisioning/decisioning.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        DecisioningModule,
        AuthModule,
    ],
})
export class AppModule { }
