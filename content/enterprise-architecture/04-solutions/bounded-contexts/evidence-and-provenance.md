# Bounded Context: Evidence & Provenance

## Purpose
Own evidence items, provenance chain, retention class, and evidence policy evaluation results. **Integrates AI for automated mapping to risk/control objectives.**

## Owned Entities (System of Record)
- **EvidenceItem**: Metadata and URI for evidence artifacts.
- **EvidencePolicyResult**: Output of evaluating evidence against a required policy (e.g., "Closure requires photo proof").

## Key Invariants
- Evidence items are immutable once uploaded (integrity check enforced by hash).
- Provenance must be recorded at time of attachment (who, when, what case/decision).

## Outbound Events
- `EVIDENCE_ATTACHED`
- `EVIDENCE_POLICY_RESULT_GENERATED`
- **`EVIDENCE_MAPPING_SUGGESTED`** (AI-proposed link to control/risk)
- **`AI_CALIBRATION_FEEDBACK_CAPTURED`** (User correction of mapping)

## Coupling & Dependencies
- Reads **Monitoring & Breaches** to validate case IDs for attachment.
- Relies on **Platform Object Store** for actual file persistence.
