# ADR-0006: Multi-Tenancy Strategy

## Status: Accepted
## Date: 2026-02-19
## Decision Makers: [CTO, CISO]

## Context
The platform must support multiple Business Units (BUs) while ensuring strict data isolation and the possibility of future external client hosting.

## Decision
Adopt a **Logical Isolation (Shared Database, Separate Schemas)** strategy using an `organization_id` or `tenant_id` on every record.

## Rationale
- **Cost**: More efficient than spinning up dedicated clusters per tenant.
- **Security**: Strict Row-Level Security (RLS) and schema-based filtering via OPA.
- **Scalability**: Allows shared infrastructure while maintaining "Virtual Private" isolation.

## Consequences
- **Positive**: Low overhead per tenant; simplified global patching.
- **Negative**: Risk of "noisy neighbor" scenarios; high complexity in RLS policy management.

## Related Decisions
- See the [Content Index](../../content/README.md) for more details.
