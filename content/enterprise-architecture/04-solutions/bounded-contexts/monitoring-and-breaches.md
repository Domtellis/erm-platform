# Bounded Context: Monitoring & Breaches

## Purpose
Manage breach signals and breach cases end-to-end, including triage, lifecycle state machine, and SLA clocks.

## Owned Entities (System of Record)
- **BreachCase**: The primary case record.
- **BreachSignal**: The raw input signal (manual or system).
- **AssessmentSuggestion**: **AI-generated** scoring and rationales (from Gemini S-AIR RAG flow). Fields include:
  - `impact_score`, `likelihood_score`, `justification`, `recommendations`
  - `ilo_clause_applied` — the specific ILO Port Code clause injected from the registry
  - `ilo_clause_title` — human-readable title of the applied ILO clause
  - `iso_clause_applied` — the ISO 45001 or ISO 31000 sub-clause cited by Gemini
  - `iso_clause_title` — human-readable title of the applied ISO clause
  - `unable_to_cite_reason` — populated when Gemini cannot map a breach to a known clause
  - `standards_warning` — boolean flag set when `SyncLog.status = 'stale'` or registry was empty at time of assessment
  - `standard_snapshot_id` — FK to `StandardSnapshot` (immutable audit trail of clauses used)
- **Evaluation**: The mapping of a breach measurement to a specific case and severity result.

## Key Invariants
- Only valid workflow transitions allowed (e.g., cannot move from `Detected` to `Closed` without `DecisionRecorded`).
- Severity updates must be recorded via an audit event.
- SLA clocks must start immediately upon signal ingestion.
- Any `AssessmentSuggestion` with `standards_warning: true` or `unable_to_cite_reason` populated is **HITL-mandatory** — auto-approval is blocked.

## Inbound Contracts

### `erm.monitoring.breach-detected.v1`
From external monitoring / stub — triggers the breach case lifecycle.

### `erm.ai.suggestion.v1`
AI-enriched payload from `erm-ai-risk-service`. Updated schema (S-AIR v2.0):
```json
{
  "breach_case_id": "string",
  "impact_score": 1,
  "likelihood_score": 1,
  "justification": "string",
  "recommendations": ["string"],
  "ilo_clause_applied": "ILO-PORT-2018 §6.1",
  "ilo_clause_title": "Permit-to-Work Systems for High-Risk Tasks",
  "iso_clause_applied": "ISO 45001:2018 §8.1.2",
  "iso_clause_title": "Eliminating hazards and reducing OHS risks",
  "unable_to_cite_reason": null,
  "standards_warning": false,
  "standard_snapshot_id": "uuid"
}
```

## Outbound Events
- `BREACH_CASE_CREATED`
- `CASE_TRIAGED`
- `THRESHOLD_EVALUATED`
- `ESCALATION_TRIGGERED`
- `CASE_CLOSED`

## Synchronous APIs
- `GET /breaches/{id}` (Read-model for UI)
- `POST /breaches/manual-submission`

## Coupling & Dependencies
- Reads **Appetite & Criteria** reference data (Thresholds) via replicated read model.
- Interacts with **erm-ai-risk-service** for real-time triage enrichment via S-AIR RAG.
- Requests approvals from **Decisioning & Approvals**.
- Receives `erm.risk.standards-unavailable.v1` and `erm.standards.out-of-sync.v1` events from `erm-ai-risk-service` for surfacing standards health warnings in the UI.
