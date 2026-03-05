import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * PortContextService — S-AIR Standards Registry (Option B)
 *
 * Retrieves relevant ILO/IMO Port-specific clauses from the local
 * PortContextClause registry based on metric name tag matching.
 *
 * The returned clauses are injected verbatim into the Gemini prompt,
 * providing grounded, legally-free, port-specific safety context.
 *
 * ISO 45001 & ISO 31000 knowledge comes from Gemini's own pre-training (Option A).
 * This service handles the Port Layer (Option B).
 */
export interface PortClauseContext {
    clause_ref: string;   // e.g. "ILO-PORT-2018 §4.3"
    title: string;        // e.g. "Crane and Lifting Equipment"
    summary: string;      // Plain-English injected into prompt
}

@Injectable()
export class PortContextService {
    private readonly logger = new Logger(PortContextService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Retrieve the top matching ILO/IMO clauses for a given breach metric.
     * Falls back gracefully to an empty array if registry is empty.
     *
     * @param metricName  - The breach metric_name (e.g. "dropped_object_rate")
     * @param maxResults  - Maximum clauses to inject (default: 2)
     */
    async getClausesForMetric(
        metricName: string,
        maxResults = 2,
    ): Promise<PortClauseContext[]> {
        try {
            const clauses = await this.prisma.portContextClause.findMany({
                where: {
                    is_active: true,
                    metric_tags: {
                        has: metricName,
                    },
                },
                take: maxResults,
                orderBy: { clause_id: "asc" },
            });

            if (clauses.length === 0) {
                this.logger.warn(
                    `No ILO clauses found for metric: "${metricName}". ` +
                    `AI will rely solely on Gemini ISO knowledge (Option A).`,
                );
            }

            return clauses.map((c) => ({
                clause_ref: c.clause_ref,
                title: c.title,
                summary: c.summary,
            }));
        } catch (err) {
            this.logger.error(`Failed to retrieve port clauses: ${err.message}`);
            return [];
        }
    }

    /**
     * Check if the Port Context Registry has any active entries.
     * Used by the health endpoint and ai.service to enforce graceful degradation.
     */
    async isRegistryHealthy(): Promise<boolean> {
        const count = await this.prisma.portContextClause.count({
            where: { is_active: true },
        });
        return count > 0;
    }

    /**
     * Get all active ILO clause IDs for snapshot audit trail.
     * Called after successful assessment to record which clauses were available.
     */
    async getActiveClauseIds(): Promise<string[]> {
        const clauses = await this.prisma.portContextClause.findMany({
            where: { is_active: true },
            select: { clause_id: true },
        });
        return clauses.map((c) => c.clause_id);
    }
}
