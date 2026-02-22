# Bounded Context: Audit & Reporting

## Purpose
Aggregates all domain events for governance audit trails, dashboard metrics, and audit pack generation.

## Owned Entities (System of Record)
- **AuditEvent**: The append-only log of all control events in the system.
- **HumanFeedbackLog**: Record of user feedback on AI suggestions (for calibration).
- **ReportNarrative**: **AI-synthesised** summaries for board/exco disclosure.

## Key Invariants
- Audit records are immutable and append-only.
- Every state change in other domains MUST have a corresponding AuditEvent.

## Synchronous APIs
- `GET /audit/case/{id}/timeline`: Returns a full history for a case.
- `POST /audit/generate-ai-narrative`: Summarises case history for disclosure.
- `POST /audit/export`: Triggers generation of a board-ready audit pack.

## Coupling & Dependencies
- Consumes events from ALL other bounded contexts.
- Uses **Platform Append-only Store** for persistence.
