# ADR 0007: Eventing vs Synchronous Communication

## Status
Accepted

## Context
We need to decide how the different Bounded Contexts (see ADR 0001) communicate. For example, when a `Breach` is triaged (F-01-03), should it synchronously call the `Evaluation` service, or should it emit an event?

## Decision
We will use an **Asynchronous Event-Driven Architecture (EDA)** for inter-context communication, with synchronous REST/GraphQL for the UI-to-Backend interaction.

### 1. Domain Events (Async)
State changes in one context trigger events. Other contexts "subscribe" to these events:
*   `BreachCreated` → Log to Audit Timeline.
*   `BreachEvaluated` → If High, notify `ApprovalEngine`.
*   `DecisionApproved` → Enable `ActionItem` creation.

### 2. Request-Response (Sync)
The UI will use synchronous calls for immediate user feedback:
*   Submitting a form.
*   Fetching details for a screen.
*   Validating input (e.g., checking if a file is already uploaded).

### 3. Event Store
We will maintain an immutable "Event Log" (F-05-01). This serves as the single source of truth for the Audit Pack generation.

## Consequences

### Positive
*   **Resilience**: A failure in the Notification service doesn't stop a user from submitting a decision.
*   **Auditability**: The event stream *is* the audit trail. We can reconstruct the state of a case at any point in time.
*   **Extensibility**: Adding new features (e.g., a "Slack Integration") just means adding a new event subscriber.

### Negative
*   **Complexity**: Developers must handle eventual consistency (the UI might not see the "updated" status for a few milliseconds).
*   **Testing**: End-to-end testing of event-driven flows is more complex than synchronous ones.

## Implementation Notes
*   **Format**: Events will be JSON-LD or CloudEvents to ensure interoperability.
*   **Reliability**: We will use a "Transactional Outbox" pattern to ensure events are never lost if the database transaction succeeds.
