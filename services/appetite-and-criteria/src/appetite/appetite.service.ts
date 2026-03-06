import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AppetiteService {
  private readonly logger = new Logger(AppetiteService.name);

  constructor(private prisma: PrismaService) { }

  async findCurrentBy(category: string) {
    this.logger.log(`Fetching current appetite for category: ${category}`);
    return this.prisma.appetiteStatement.findFirst({
      where: { category, is_active: true },
      include: { thresholds: true },
      orderBy: { created_at: "desc" },
    });
  }

  async findAll() {
    return this.prisma.appetiteStatement.findMany({
      include: { thresholds: true },
    });
  }

  async updateThreshold(thresholdId: string, limitValue: number) {
    this.logger.log(`Updating threshold ${thresholdId} to limit: ${limitValue}`);
    return this.prisma.threshold.update({
      where: { id: thresholdId },
      data: { limit_value: limitValue },
    });
  }
}
