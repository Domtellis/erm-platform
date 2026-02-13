---
doc_type: service_blueprint
blueprint_id: sb-03-control-assurance-audit-pack
value_streams: [VS-06, VS-05, VS-08]
last_updated: 2026-02-03
---

# Service Blueprint — Control Assurance and Audit Pack

## Trigger
- Scheduled control execution or audit/customer request (VS-06).

## Personas
- Control Owner (per-004)
- Second line assurance (per-004)
- Internal Audit (implicit)
- Compliance/Data Owner (per-006) for external artefacts

## Controls and evidence
- Evidence provenance minimums are mandatory (source, collector, timestamp, integrity hash, retention class).
- Exceptions require delegated approval and timebox.
- Closure validation for issues is independent for defined severities.

## Acceptance criteria
- Given a control execution completes
  When evidence is attached or ingested
  Then provenance fields and integrity hash are recorded before closure.

- Given an audit pack is requested
  When generated
  Then it includes traceability links to control executions, tests, issues, and attestations.

## NFR controls
- Auditability: tamper-evident evidence store and immutable audit trail.
- SoD: operate/test/approve/attest roles separated.
- Retention: evidence retention enforced; legal hold supported.
- Lineage: evidence links back to source system and control objective; pack links to risks/treatments where applicable.
