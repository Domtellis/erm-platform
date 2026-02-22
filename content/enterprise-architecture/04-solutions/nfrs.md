# Non-Functional Requirements (NFRs)

This document outlines the specific measurable requirements that the architecture must satisfy.

## Reliability & Availability
- **Event Delivery**: At-least-once delivery for all domain events.
- **Idempotency**: All event consumers must handle duplicate messages without side effects.

## Security & Compliance
- **Audit Latency**: Audit events must be persisted within 200ms of the domain event commit.
- **Evidence Integrity**: All evidence items must have a SHA-256 hash recorded at time of upload.

## Intelligence & AI Oversight
- **AI Latency**: 95% of AI suggestions must be delivered within 15 seconds of the `breach-detected` event.
- **Hallucination Oversight**: 100% of high/critical breaches must require manual "Accept" or "Modify" before the case can proceed.
- **Feedback Integrity**: Disagreement between AI and human must be recorded for 100% of cases to enable monthly bias audits.

## Scalability
- **Tenant Growth**: Architecture must support 100+ business units without degradation in individual tenant performance.
- **AI Throughput**: Service must handle concurrent bursts of 50+ breaches without increasing latency P95 beyond 20s.
