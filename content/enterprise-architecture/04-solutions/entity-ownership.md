# Entity Ownership (SoR) Matrix

This matrix defines the authoritative System of Record (SoR) for each business entity in the ERM platform. 

| Entity | System of Record | Other contexts may... | Change allowed by... |
| :--- | :--- | :--- | :--- |
| **BreachCase** | Monitoring & Breaches | read, subscribe to events | Monitoring context only |
| **BreachSignal** | Monitoring & Breaches | read | Monitoring context only |
| **AppetiteStatementVersion** | Appetite & Criteria | read, cache | Appetite context only |
| **Threshold** | Appetite & Criteria | read, cache | Appetite context only |
| **Evaluation** | Monitoring & Breaches | read | Monitoring context only |
| **Decision** | Decisioning & Approvals | read | Decisioning context only |
| **Approval** | Decisioning & Approvals | read | Decisioning context only |
| **EvidenceItem** | Evidence & Provenance | read, reference | Evidence context only |
| **EvidencePolicyResult** | Evidence & Provenance | subscribe | Evidence context only |
| **ActionItem** | Action Management | read | Action Management only |
| **AuditEvent** | Audit & Reporting | query | Audit context only |

## Ownership Rules
1. **No Direct Writes**: No context may directly write to the database tables of another context.
2. **Event-Driven Reconciliation**: If a context needs to update its local state based on another context's data, it must do so by consuming an event.
3. **Reference by ID**: Cross-context references should always be by Entity ID, never by joining tables.
