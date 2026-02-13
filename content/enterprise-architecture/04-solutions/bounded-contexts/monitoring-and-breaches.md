# Bounded Context: Monitoring & Breaches

## Purpose
Manage breach signals and breach cases end-to-end, including triage, lifecycle state machine, and SLA clocks.

## Owned Entities (System of Record)
- **BreachCase**: The primary case record.
- **BreachSignal**: The raw input signal (manual or system).
- **Evaluation**: The mapping of a breach measurement to a specific case and severity result.

## Key Invariants
- Only valid workflow transitions allowed (e.g., cannot move from `Detected` to `Closed` without `DecisionRecorded`).
- Severity updates must be recorded via an audit event.
- SLA clocks must start immediately upon signal ingestion.

## Inbound Contracts
- `erm.monitoring.breach-detected.v1` (from external monitoring / stub)

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
- Requests approvals from **Decisioning & Approvals**.
