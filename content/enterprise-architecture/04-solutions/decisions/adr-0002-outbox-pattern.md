# ADR 0002: Reliable Event Publishing (Outbox Pattern)

## Status
Accepted

## Context
In a distributed system, we must ensure that a domain state change in the database and the publishing of a corresponding event are atomic. Failing to do so can lead to "ghost" events or lost updates.

## Decision
We will use the **Transactional Outbox** pattern for all domain state changes that trigger events.

## Rationale
- **Atomicity**: Guarantees that the event is only published if the database transaction succeeds.
- **Resilience**: If the event bus is down, the outbox processor can retry until delivery is successful.

## Consequences
- Every service database must include an `outbox` table.
- A background "relay" process/service is required to poll the outbox and publish to the bus.
