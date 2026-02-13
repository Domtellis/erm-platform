# Bounded Context: Action Management

## Purpose
Own action items, owners, due dates, and completion verification logic.

## Owned Entities (System of Record)
- **ActionItem**: The specific remediation or preventive action.

## Key Invariants
- Closure of an action item requires associated evidence (if mandated by severity).

## Outbound Events
- `ACTION_CREATED`
- `ACTION_UPDATED`
- `ACTION_COMPLETED`

## Coupling & Dependencies
- Links **ActionItems** to **BreachCases** owned by Monitoring & Breaches.
- Requests evidence validation from **Evidence & Provenance**.
