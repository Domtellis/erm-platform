import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * StandardsHealthService
 *
 * Exposes a health check for the Port Context Registry.
 * Used by the /health/standards endpoint and by the AI service
 * to enforce graceful degradation when the registry is empty or stale.
 */
export interface StandardsHealthStatus {
    healthy: boolean;
    active_clauses: number;
    last_sync: Date | null;
    sync_status: string | null;
    warning: string | null;
}

@Injectable()
export class StandardsHealthService {
    private readonly logger = new Logger(StandardsHealthService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getStatus(): Promise<StandardsHealthStatus> {
        const [clauseCount, lastSync] = await Promise.all([
            this.prisma.portContextClause.count({ where: { is_active: true } }),
            this.prisma.syncLog.findFirst({ orderBy: { checked_at: "desc" } }),
        ]);

        const healthy = clauseCount > 0;
        const warning = !healthy
            ? "Port Context Registry is empty. AI assessments will lack ILO Port clause grounding. Run the ingestion guide to seed data."
            : lastSync?.status === "stale"
                ? "Standards may be out of date. Last sync reported a newer version is available. Please review and re-ingest."
                : null;

        return {
            healthy,
            active_clauses: clauseCount,
            last_sync: lastSync?.checked_at ?? null,
            sync_status: lastSync?.status ?? null,
            warning,
        };
    }
}
