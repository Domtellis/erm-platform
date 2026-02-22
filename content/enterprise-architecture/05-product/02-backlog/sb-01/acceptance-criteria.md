# SB-01 MVP Acceptance Criteria (Safety) — Feature-led

This document defines cross-cutting acceptance criteria that apply across the SB-01 MVP backlog.

## Global criteria (applies to all features)
- All control-relevant actions emit audit events per `governance/audit/audit-events-catalog.yaml` (Feature: F-05-01).
- Audit events are append-only and immutable (F-05-01).
- All user actions are authorised by role (RBAC implied across all features).
- Workflow transitions are validated by the state machine (F-01-02).
- Evidence policy gates approval/closure where configured (F-04-02).

## F-03-03 Approvals + SoD enforcement (High -> BU Risk Owner)
- High severity decisions must be approved by **BU Risk Owner**.
- SoD enforced: approver cannot be the same as decision submitter.
- Decision record becomes immutable upon approval.
- Approval must emit `DECISION_APPROVED` with `sod_check_passed=true`.

## F-04-02 Evidence policy gating
- High severity requires the configured minimum evidence bundle before:
  - DecisionApproved
  - Closed
- Evidence items store type + URI + uploaded_by + uploaded_at (F-04-01).
- Evidence attachments emit `EVIDENCE_ATTACHED`.

## F-05-02 Audit pack export
Audit pack must include at minimum:
- Case summary and state timeline
- Appetite statement version and threshold used
- Evaluation results (measured value, result, computed severity, rationale)
- Decision, approvals, and SoD outcome
- Evidence index (IDs, types, URIs)
- Action plan (actions and completion evidence)
- Audit event timeline
- Export emits `AUDIT_PACK_EXPORTED`

## F-06-01 AI-Assisted Triage & Scoring
- AI suggestion must be generated and visible within **15 seconds** of case creation (p50).
- Suggestion must include impact, likelihood, justification, and regulatory references.
- High severity cases must display a clear "Review Required" warning.

## F-06-02 Human-in-the-Loop Calibration
- Acceptance or modification of AI suggestions must emit `AI_CALIBRATION_FEEDBACK_CAPTURED`.
- Modification rationale is **mandatory** for all severity changes.
- Disagreement tracking must capture delta between AI suggestion and human decision.
