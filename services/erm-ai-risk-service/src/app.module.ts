import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { AiModule } from "./ai/ai.module";
import { OutboxModule } from "./outbox/outbox.module";
import { StandardsModule } from "./standards/standards.module";
import { SyncEngineModule } from "./sync/sync-engine.module";
import { envSchema } from "./config/env.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    OutboxModule,
    StandardsModule,
    SyncEngineModule,
    AiModule,
  ],
})
export class AppModule {}
