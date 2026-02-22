# ADR-0002: Identifiers and Immutability

## Status: Accepted
## Date: 2026-02-17
## Decision Makers: [Engineering Lead, CTO]

## Context
The ERM Platform requires a robust identification strategy for audit events, breaches, and decisions. Legacy systems used simple auto-incrementing integers, which are predictable, leak sequence information, and are difficult to merge across multi-tenant shards.

## Decision
Use **UUID v7** for all primary keys and **K-Sorted Human-Readable IDs** for public-facing references (e.g., `BRC-2026-001`).

## Rationale
- **UUID v7**: Provides time-sortable uniqueness, enabling efficient database indexing while remaining globally unique across shards.
- **Human-Readable IDs**: Required for audit discussions and committee packs.
- **Immutability**: All records in the `audit` service must be immutable. Once a UUID is assigned, it cannot be recycled.

## Consequences
- **Positive**: Simplified data merging, enhanced security (non-sequential), and better auditability.
- **Negative**: Increased storage size for keys (128-bit vs 32-bit).

## Related Decisions
- [ADR-0003: Evidence Provenance Model](./0003-evidence-provenance-model.md)
- [PRD: Platform Foundations](../../content/enterprise-architecture/05-product/01-prds/sb-01/prd.md)
