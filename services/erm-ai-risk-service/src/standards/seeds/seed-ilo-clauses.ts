/**
 * ILO Port Clause Seed Script — S-AIR Phase 1
 *
 * Ingests the ILO Port Code 2018 clauses from the local JSON file
 * into the PortContextClause table of the ai_risk schema.
 *
 * Run from the service directory:
 *   npx ts-node src/standards/seeds/seed-ilo-clauses.ts
 *
 * Or via npm script (add to package.json):
 *   "standards:seed": "ts-node src/standards/seeds/seed-ilo-clauses.ts"
 */

import { PrismaClient } from "@prisma/client/ai-risk";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ClauseSeed {
  source: string;
  clause_id: string;
  clause_ref: string;
  title: string;
  summary: string;
  metric_tags: string[];
  version: string;
  is_active: boolean;
}

async function main() {
  const seedPath = path.join(__dirname, "ilo-port-2018-clauses.json");
  const clauses: ClauseSeed[] = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

  console.log(`\n🌱 Seeding ${clauses.length} ILO Port 2018 clauses...\n`);

  for (const clause of clauses) {
    const result = await prisma.portContextClause.upsert({
      where: {
        source_clause_id: {
          source: clause.source,
          clause_id: clause.clause_id,
        },
      },
      create: clause,
      update: {
        title: clause.title,
        summary: clause.summary,
        metric_tags: clause.metric_tags,
        is_active: clause.is_active,
      },
    });
    console.log(`  ✅ ${result.clause_ref} — ${result.title}`);
  }

  // Record the sync log entry
  await prisma.syncLog.create({
    data: {
      source: "ILO_PORT_2018",
      status: "ok",
      version_found: "2018",
      notes: `Seeded ${clauses.length} clauses from local JSON file.`,
    },
  });

  console.log(`\n✅ Seed complete. SyncLog entry created.\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
