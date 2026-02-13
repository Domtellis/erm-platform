# Bounded Context: Evidence & Provenance

## Purpose
Own evidence items, provenance chain, retention class, and evidence policy evaluation results.

## Owned Entities (System of Record)
- **EvidenceItem**: Metadata and URI for evidence artifacts.
- **EvidencePolicyResult**: Output of evaluating evidence against a required policy (e.g., "Closure requires photo proof").

## Key Invariants
- Evidence items are immutable once uploaded (integrity check enforced by hash).
- Provenance must be recorded at time of attachment (who, when, what case/decision).

## Outbound Events
- `EVIDENCE_ATTACHED`
- `EVIDENCE_POLICY_RESULT_GENERATED`

## Coupling & Dependencies
- Reads **Monitoring & Breaches** to validate case IDs for attachment.
- Relies on **Platform Object Store** for actual file persistence.
