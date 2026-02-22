---
doc_type: journey_map
journey_id: journey-incident-monitoring-lead
persona_id: per-005
primary_value_streams: [VS-07, VS-09]
secondary_value_streams: [VS-01, VS-03, VS-06]
last_updated: 2026-02-21
---

# Journey Map — Incident & Monitoring Lead (Ops / SOC / ITSM)

## Goals
- Detect, triage, and escalate breaches quickly and correctly.
- Coordinate mitigations with clear ownership and SLAs.
- Drive learning loop: RCA → CAPA → updates to risks/controls/KRIs.

## Steps (end-to-end)
| # | Value stream | What the user is trying to do | Emotions | Pain points | Success criteria |
|---|-------------|--------------------------------|----------|-------------|------------------|
| 1 | VS-01 → VS-07 | Ensure sources live; freshness checks; thresholds + routing configured | Confident | Data access; stale feeds | Freshness compliance high |
| 2 | VS-07 | Triage alerts; correlate; confirm breach; open breach case | **Focused** | Signal fatigue | **AI-Enriched Triage** reduces false positives |
| 3 | VS-07 | Launch mitigations; track SLAs; escalate as needed | Intense | Ownership unclear | SLA timers + routing work |
| 4 | VS-09 | Capture incident; classify; contain; perform RCA | Focused | RCA incomplete | RCA standard enforced |
| 5 | VS-09 | Create CAPA; validate closure; publish learnings | Accountable | Closure without verification | Effectiveness check required |
| 6 | VS-09 → VS-07 → VS-03 | Update risks/assessments and KRIs; tune thresholds | Satisfied | No follow-through | Auto-created reassessment tasks |

## Moments that matter
- **AI-first breach workflow** is predictable and audit-ready (VS-07).
- RCA produces actionable CAPA and auto-updates to KRIs/risks (VS-09).

## Success criteria (measurable)
- Time-to-acknowledge meets tiered SLA.
- False alert rate trends downward.
- Recurrence rate trends downward.
