import { Module } from "@nestjs/common";
import { SyncEngineService } from "./sync-engine.service";
import { PrismaModule } from "../prisma/prisma.module";
import { OutboxModule } from "../outbox/outbox.module";

@Module({
  imports: [PrismaModule, OutboxModule],
  providers: [SyncEngineService],
  exports: [SyncEngineService],
})
export class SyncEngineModule {}
