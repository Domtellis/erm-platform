# Integration Patterns

This document outlines the standard patterns for communication between bounded contexts and external systems.

## Event-Driven vs synchronous APIs

We follow a simple heuristic for choosing the integration style:

| Use Events When... | Use Sync APIs When... |
| :--- | :--- |
| A domain state has changed (e.g., `CASE_TRIAGED`). | It is a user-facing read that must be immediate. |
| Multiple secondary systems care (Audit, Notify, SLA). | The caller can tolerate a direct dependency. |
| Resurrection and traceability are required. | External systems require a standard REST hook. |
| Processing can be asynchronous. | Transactional consistency is strictly required (rare). |

## Core Patterns

### 1. Outbox Pattern
To ensure atomicity between database updates and event publishing, all services must use the **Transactional Outbox** pattern. Events are written to an `outbox` table in the same transaction as the domain entity update.

### 2. Idempotency
All event consumers MUST implement idempotency checks based on the `event_id` to handle "at-least-once" delivery semantics.

### 3. Correlation IDs
Every request and event must carry a `correlation_id` in its headers/metadata to enable end-to-end tracing across services.

### 4. Dead Letter Queues (DLQ)
Failed processing must be retried with exponential backoff before being moved to a DLQ for manual inspection/reprocessing.
