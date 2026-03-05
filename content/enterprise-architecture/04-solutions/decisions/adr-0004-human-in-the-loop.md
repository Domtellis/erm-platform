# ADR 0004: Human-in-the-Loop Governance

## Status
Accepted

## Last Updated
2026-03-05

## Context
To maintain "Decision Integrity" and regulatory compliance (ISO 45001/GDPR), the platform cannot rely on fully autonomous AI decisioning. We must ensure that human experts remain the ultimate authority for risk assessments.

With the S-AIR architecture, two additional HITL escalation triggers have been introduced beyond the base mandatory review gate.

## Decision
We will enforce a **Mandatory Human-in-the-Loop (HITL)** governance model for all AI-generated suggestions.

## Rationale
- **Accountability**: Ensures a "Competent Person" (Risk Lead) takes legal and operational responsibility for every assessment.
- **Safety**: Prevents "AI Hallucinations" or under-assessments from directly impacting safety controls.
- **Traceability**: Every finalized assessment record includes both the AI suggestion and the human sign-off/override.

## HITL Escalation Triggers

| Trigger | Condition | Required Action |
|---|---|---|
| **Standard HITL gate** | Every AI assessment | Risk Lead must Accept or Override before an assessment is finalized |
| **Standards Unavailable** | `erm.risk.standards-unavailable.v1` event emitted; `PortContextClause` registry is empty | Mandatory review; AI Oversight Lead must be notified; standards registry must be restored before batch processing resumes |
| **Stale Standards Registry** | `SyncLog.status = 'stale'`; `standards_warning: true` on assessment | Assessment may proceed but HITL review is mandatory; patch notes must be attached explaining why the stale registry was accepted |
| **Unable to Cite** | `unable_to_cite_reason` is populated on an `AssessmentSuggestion` | Risk Lead must verify the AI's reasoning independently against ISO 45001/31000 before accepting |

## Consequences
- The Experience Layer (Workflows/Blueprints) must include an explicit `ai_suggestion_reviewed` gate.
- The `Decisioning & Approvals` bounded context must support "Accept/Override" flags.
- Auto-approval of AI suggestions is strictly disabled in the service configuration.
- The `standards_warning` flag on `AssessmentSuggestion` must surface visibly in the Risk Lead UI — it is a hard blocker for any downstream auto-action.
- AI Oversight Lead receives `erm.standards.out-of-sync.v1` events and is responsible for coordinating with Compliance to restore the registry.
