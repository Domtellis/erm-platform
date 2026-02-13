# Non-Functional Requirements (NFRs)

This document outlines the specific measurable requirements that the architecture must satisfy.

## Reliability & Availability
- **Event Delivery**: At-least-once delivery for all domain events.
- **Idempotency**: All event consumers must handle duplicate messages without side effects.

## Security & Compliance
- **Audit Latency**: Audit events must be persisted within 200ms of the domain event commit.
- **Evidence Integrity**: All evidence items must have a SHA-256 hash recorded at time of upload.

## Performance
- **UI Responsiveness**: Key dashboard metrics (e.g., Breach Counts) should update within 2 seconds of a state change event.

## Scalability
- **Tenant Growth**: Architecture must support 100+ business units without degradation in individual tenant performance.
