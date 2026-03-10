import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";
import { OutboxService } from "../outbox/outbox.service";

/**
 * SyncEngineService — S-AIR Phase 3
 *
 * Runs a weekly check to determine if the ingested ILO Port Code data
 * is still current with the authoritative source publication.
 *
 * Strategy: HEAD request to ILO publication page + last-modified header check.
 * If a newer version is detected, the SyncLog is marked "stale" and a
 * Kafka event is emitted so the UI can surface a warning banner.
 *
 * The AI assessments are never blocked by a stale status — but users are informed.
 */
@Injectable()
export class SyncEngineService {
  private readonly logger = new Logger(SyncEngineService.name);

  // Known ILO Port publication URL for version tracking
  private readonly ILO_PORT_URL =
    "https://www.ilo.org/wcmsp5/groups/public/---ed_protect/---protrav/---safework/documents/normativeinstrument/wcms_716535.pdf";

  // Current expected version of the ingested data
  private readonly CURRENT_VERSION = "2018";

  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  /**
   * Weekly sync check — every Monday at 06:00 UTC.
   * Can also be triggered manually via ILO sync admin endpoint.
   */
  @Cron(CronExpression.EVERY_WEEK)
  async checkStandardsFreshness(): Promise<void> {
    this.logger.log("🔄 Running weekly ILO Port Standards sync check...");

    try {
      const response = await fetch(this.ILO_PORT_URL, { method: "HEAD" });
      const lastModified = response.headers.get("last-modified");

      // Attempt to detect a newer version from the Last-Modified header
      const isStale = this.detectVersionChange(lastModified);

      await this.prisma.syncLog.create({
        data: {
          source: "ILO_PORT_2018",
          status: isStale ? "stale" : "ok",
          version_found: this.CURRENT_VERSION,
          notes: isStale
            ? `ILO publication last-modified header changed: ${lastModified}. Manual re-ingestion may be required.`
            : `No changes detected. Last-Modified: ${lastModified}`,
        },
      });

      if (isStale) {
        this.logger.warn(
          `⚠️  ILO Port Code may have been updated. Last-Modified: ${lastModified}`,
        );
        await this.outboxService.enqueue("erm.standards.out-of-sync.v1", {
          source: "ILO_PORT_2018",
          last_modified: lastModified,
          detected_at: new Date(),
          action_required:
            "Review ILO publication and re-run standards:seed if content has changed.",
        });
      } else {
        this.logger.log(
          "✅ ILO Port Standards sync check passed — up to date.",
        );
      }
    } catch (err) {
      this.logger.error(`Standards sync check failed: ${err.message}`);
      await this.prisma.syncLog.create({
        data: {
          source: "ILO_PORT_2018",
          status: "failed",
          notes: `Sync check error: ${err.message}`,
        },
      });
    }
  }

  /**
   * Detect if the document has been modified since our known publish date.
   * ILO Port Code 2018 was published in 2018; any Last-Modified after
   * 2019-01-01 may signal an update or a corrigendum.
   */
  private detectVersionChange(lastModified: string | null): boolean {
    if (!lastModified) return false;
    const modifiedDate = new Date(lastModified);
    const knownPublishDate = new Date("2019-01-01");
    return modifiedDate > knownPublishDate;
  }
}
