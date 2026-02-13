# Bounded Context: Audit & Reporting

## Purpose
Aggregates all domain events for governance audit trails, dashboard metrics, and audit pack generation.

## Owned Entities (System of Record)
- **AuditEvent**: The append-only log of all control events in the system.

## Key Invariants
- Audit records are immutable and append-only.
- Every state change in other domains MUST have a corresponding AuditEvent.

## Synchronous APIs
- `GET /audit/case/{id}/timeline`: Returns a full history for a case.
- `POST /audit/export`: Triggers generation of a board-ready audit pack.

## Coupling & Dependencies
- Consumes events from ALL other bounded contexts.
- Uses **Platform Append-only Store** for persistence.
