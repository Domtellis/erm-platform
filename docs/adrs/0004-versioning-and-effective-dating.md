# ADR-0004: Versioning and Effective Dating

## Status: Accepted
## Date: 2026-02-18
## Decision Makers: [Product Lead, CRO]

## Context
Risk appetites and authority matrices change over time. An audit must be able to prove which version of a policy was active at the exact moment a decision was made.

## Decision
Implement **Temporal Versioning** using `effective_from` and `effective_to` timestamps for all governance artifacts.

## Rationale
- **Traceability**: Allows "time-travel" audits to reconstruct state at any historical point.
- **Governance**: Supports draft vs. published states with mandatory approval gates before a new version becomes effective.

## Consequences
- **Positive**: Full audit compliance for regulatory standards.
- **Negative**: Increased query complexity (requires range checks).

## Related Decisions
- [AI Governance Policy](../../content/governance/policies/ai-governance-policy.md)
