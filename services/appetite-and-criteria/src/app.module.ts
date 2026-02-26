import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppetiteModule } from "./appetite/appetite.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AppetiteModule,
  ],
})
export class AppModule {}
