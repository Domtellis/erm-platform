import { Module } from "@nestjs/common";
import { AppetiteService } from "./appetite.service";
import { AppetiteController } from "./appetite.controller";

@Module({
  controllers: [AppetiteController],
  providers: [AppetiteService],
})
export class AppetiteModule {}
