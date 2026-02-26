import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  async getRiskTrends(days: number = 30) {
    // ... (existing code, keeping it unchanged)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await this.prisma.auditEvent.findMany({
      where: {
        type: {
          in: [
            "erm.monitoring.breach-detected.v1",
            "erm.risk.assessment-created.v1",
          ],
        },
        occurred_at: {
          gte: startDate,
        },
      },
      orderBy: {
        occurred_at: "asc",
      },
    });

    const trendMap = new Map<
      string,
      {
        date: string;
        critical: number;
        high: number;
        medium: number;
        low: number;
      }
    >();

    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      trendMap.set(dateStr, {
        date: dateStr,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      });
    }

    events.forEach((event) => {
      const dateStr = event.occurred_at.toISOString().split("T")[0];
      const payload = event.payload as any;
      const severity = (
        payload.severity ||
        payload.risk_level ||
        "low"
      ).toLowerCase();

      if (trendMap.has(dateStr)) {
        const dayStats = trendMap.get(dateStr);
        if (dayStats) {
          if (severity === "critical") dayStats.critical++;
          else if (severity === "high") dayStats.high++;
          else if (severity === "medium") dayStats.medium++;
          else dayStats.low++;
        }
      }
    });

    return Array.from(trendMap.values());
  }

  async getBurndown(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Calculate Initial Balance (Total Open Breaches before Start Date)
    const initialInflow = await this.prisma.auditEvent.count({
      where: {
        type: "erm.monitoring.breach-detected.v1",
        occurred_at: { lt: startDate },
      },
    });

    const initialOutflow = await this.prisma.auditEvent.count({
      where: {
        type: "erm.monitoring.breach-closed.v1",
        occurred_at: { lt: startDate },
      },
    });

    let currentBalance = initialInflow - initialOutflow;

    // 2. Fetch all relevant events in the window
    const events = await this.prisma.auditEvent.findMany({
      where: {
        type: {
          in: [
            "erm.monitoring.breach-detected.v1",
            "erm.monitoring.breach-closed.v1",
          ],
        },
        occurred_at: { gte: startDate },
      },
      orderBy: { occurred_at: "asc" },
    });

    // 3. Build Daily Snapshot
    const dailyMap = new Map<string, { date: string; open: number }>();

    // Initialize all days with 0 (will fill with running total)
    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      dailyMap.set(dateStr, { date: dateStr, open: 0 });
    }

    let eventIndex = 0;
    const eventCount = events.length;

    // Iterate through each day and apply events that happened ON that day
    for (const [dateStr, update] of dailyMap) {
      // Process events for this day
      while (eventIndex < eventCount) {
        const event = events[eventIndex];
        const eventDate = event.occurred_at.toISOString().split("T")[0];

        if (eventDate > dateStr) break; // Event is in the future relative to this loop day

        if (event.type === "erm.monitoring.breach-detected.v1") {
          currentBalance++;
        } else if (event.type === "erm.monitoring.breach-closed.v1") {
          currentBalance--;
        }
        eventIndex++;
      }
      // Set the closing balance for the day
      update.open = currentBalance;
    }

    return Array.from(dailyMap.values());
  }
}
