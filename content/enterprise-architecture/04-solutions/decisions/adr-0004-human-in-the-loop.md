# ADR 0004: Human-in-the-Loop Governance

## Status
Accepted

## Context
To maintain "Decision Integrity" and regulatory compliance (ISO 45001/GDPR), the platform cannot rely on fully autonomous AI decisioning. We must ensure that human experts remain the ultimate authority for risk assessments.

## Decision
We will enforce a **Mandatory Human-in-the-Loop (HITL)** governance model for all AI-generated suggestions.

## Rationale
- **Accountability**: Ensures a "Competent Person" (Risk Lead) takes legal and operational responsibility for every assessment.
- **Safety**: Prevents "AI Hallucinations" or under-assessments from directly impacting safety controls.
- **Traceability**: Every finalized assessment record includes both the AI suggestion and the human sign-off/override.

## Consequences
- The Experience Layer (Workflows/Blueprints) must include an explicit `ai_suggestion_reviewed` gate.
- The `Decisioning & Approvals` bounded context must support "Accept/Override" flags.
- Auto-approval of AI suggestions is strictly disabled in the service configuration.
