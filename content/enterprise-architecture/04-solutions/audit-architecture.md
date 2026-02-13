# Audit Architecture

The audit architecture is the "Governance Heart" of the ERM platform, providing an immutable record of all control actions.

## 1. The Audit Event Pipeline
1. **Domain Event**: A service performs a state change (e.g., `APPROVE_DECISION`).
2. **Outbox Commit**: The domain change and the `AUDIT_EVENT` are committed to the local DB in one transaction.
3. **Bus Broadcast**: The Outbox processor publishes the event to the Event Bus.
4. **Audit Aggregator**: A dedicated service (Audit & Reporting) consumes ALL events.
5. **Cold Storage**: The Audit service writes the raw event to an append-only, logically immutable store (e.g., WORM storage, Ledger DB).

## 2. Immutability Guarantees
- **Write-Once**: The Audit Store does not support `UPDATE` or `DELETE` operations on existing records.
- **Cryptographic Chaining**: (Optional Next Step) Each audit event contains the hash of the previous event to ensure the trail hasn't been tampered with.

## 3. Querying & Reporting
- **Timeline View**: Highly optimized index on `breach_case_id + timestamp`.
- **Audit Pack Export**: A background process that pulls events, validates their provenance, and generates a PDF/JSON bundle for external review.

## 4. Retention
- Governance mandate: 7-year retention for all `governance_audit` class events.
