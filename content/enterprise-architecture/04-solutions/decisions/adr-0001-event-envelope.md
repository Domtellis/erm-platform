# ADR 0001: Event Envelope Standard (CloudEvents)

## Status
Accepted

## Context
We need a standard metadata envelope for all asynchronous messages to ensure consistent routing, auditing, and observability across multiple bounded contexts.

## Decision
We will adopt the **CloudEvents 1.0** specification for all domain events.

## Rationale
- **Industry Standard**: CloudEvents is a CNCF project with broad library support.
- **Interoperability**: Provides fixed fields for `id`, `source`, `type`, and `time`, which simplifies the implementation of the Audit Aggregator.
- **Flexibility**: The `data` property allows the domain-specific payload to evolve independently of the envelope.

## Consequences
- All event producers must wrap their domain payloads in the CloudEvents envelope.
- Platform middleware (Event Bus) can leverage headers for routing without parsing the inner payload.
