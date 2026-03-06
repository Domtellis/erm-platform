import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { GeminiClient } from "./gemini.client";
import { PrismaModule } from "../prisma/prisma.module";
import { OutboxModule } from "../outbox/outbox.module";
import { StandardsModule } from "../standards/standards.module";


@Module({
  imports: [PrismaModule, OutboxModule, StandardsModule],
  controllers: [AiController],
  providers: [AiService, GeminiClient],
  exports: [AiService],
})
export class AiModule { }
