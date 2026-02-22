# Bounded Context: Action Management

## Purpose
Own action items, owners, due dates, and completion verification logic. **Includes AI-assisted comparison of evidence against target residual risk outcomes.**

## Owned Entities (System of Record)
- **ActionItem**: The specific remediation or preventive action.

## Key Invariants
- Closure of an action item requires associated evidence (if mandated by severity).
- **AI-First Verification**: The `erm-ai-risk-service` performs the initial verification pass before human sign-off.

## Outbound Events
- `ACTION_CREATED`
- `ACTION_UPDATED`
- `ACTION_COMPLETED`

## Coupling & Dependencies
- Links **ActionItems** to **BreachCases** owned by Monitoring & Breaches.
- Requests evidence validation from **Evidence & Provenance**.
