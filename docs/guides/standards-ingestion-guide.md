# Standards Ingestion Guide — ILO Port Code 2018

## Overview

This guide explains how to seed and maintain the **Port Context Registry** — the local database of ILO/IMO port safety clause summaries used by the AI Risk Assessment service to ground its assessments.

> **Legal Note**: This guide uses the [ILO Code of Practice on Safety and Health in Ports (2018)](https://www.ilo.org/wcmsp5/groups/public/---ed_protect/---protrav/---safework/documents/normativeinstrument/wcms_716535.pdf), freely published by the International Labour Organization. No ISO standard text is stored or reproduced.

---

## Initial Seed (Phase 1 — Run Once)

From the `services/erm-ai-risk-service` directory:

```bash
# Install dependencies (if not already done)
npm install

# Run the seed script
npx ts-node src/standards/seeds/seed-ilo-clauses.ts
```

This will insert the 6 approved ILO Port Code 2018 clauses into the `ai_risk.PortContextClause` table and create a `SyncLog` entry.

**Expected output:**
```
🌱 Seeding 6 ILO Port 2018 clauses...

  ✅ ILO-PORT-2018 §3.1 — Occupational Health and Safety Management
  ✅ ILO-PORT-2018 §3.5 — Incident Investigation and Near Miss Reporting
  ✅ ILO-PORT-2018 §4.3 — Crane and Lifting Equipment Safety
  ✅ ILO-PORT-2018 §4.3.2 — Safe Working Load (SWL) Exceedance
  ✅ ILO-PORT-2018 §4.7 — Adverse Weather Conditions
  ✅ ILO-PORT-2018 §5.2 — Falls from Height

✅ Seed complete. SyncLog entry created.
```

---

## Metric-to-Clause Mapping

| Your Metric Name | ILO Clause | ISO 45001 (cited by Gemini) |
|---|---|---|
| `ltifr` | §3.1 OHS Management | §9.1 Monitoring & Measurement |
| `dropped_object_rate` | §4.3 Crane & Lifting Equipment | §6.1.2 Hazard ID & Risk Assessment |
| `near_miss_reporting_rate` | §3.5 Incident Investigation | §10.2 Incident & Nonconformity |
| `overload_alarm_frequency` | §4.3.2 Safe Working Load | §8.1 Operational Planning |
| `wind_protocol_breach_count` | §4.7 Adverse Weather | §6.1.4 Planning Actions |
| `wah_incident_rate` | §5.2 Falls from Height | §8.1.2 Hierarchy of Controls |

---

## Adding a New Metric or Clause

1. Open `src/standards/seeds/ilo-port-2018-clauses.json`
2. Add a new entry following the existing structure:

```json
{
  "source": "ILO_PORT_2018",
  "clause_id": "ILO-PORT-2018-X.X",
  "clause_ref": "ILO-PORT-2018 §X.X",
  "title": "Clause Title",
  "summary": "Plain-English summary of what this clause requires. This text is injected into the AI prompt.",
  "metric_tags": ["your_metric_name"],
  "version": "2018",
  "is_active": true
}
```

3. Re-run the seed script (it uses `upsert` so existing records are safely updated)
4. Raise a PR targeting the `main` branch for Compliance team review

---

## Checking Registry Health

```bash
# Via the API
curl http://localhost:3004/health/standards

# Expected response (healthy)
{
  "healthy": true,
  "active_clauses": 6,
  "last_sync": "2026-03-05T18:00:00Z",
  "sync_status": "ok",
  "warning": null
}
```

---

## Handling "Standards Out of Sync" Warnings

The Sync Engine runs a weekly check on the ILO publication URL. If a change is detected, the UI will display:

> *"Port safety standards may need review. Last verified: [date]."*

**Resolution steps:**
1. Visit the [ILO Port Code publication](https://www.ilo.org/wcmsp5/groups/public/---ed_protect/---protrav/---safework/documents/normativeinstrument/wcms_716535.pdf)
2. Compare against the existing `ilo-port-2018-clauses.json` entries
3. Update any changed `summary` fields and re-run the seed script
4. The next automated sync check will record a fresh `ok` status

---

> [!NOTE]
> The curated `summary` fields in the seed JSON are plain-English interpretations crafted for prompt injection. They are not verbatim clause reproductions. The Compliance team owns and must review these summaries annually.
