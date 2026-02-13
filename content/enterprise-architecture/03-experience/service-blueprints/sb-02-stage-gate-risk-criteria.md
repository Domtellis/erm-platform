---
doc_type: service_blueprint
blueprint_id: sb-02-stage-gate-risk-criteria
value_streams: [VS-00, VS-03, VS-04, VS-05]
last_updated: 2026-02-03
---

# Service Blueprint — Stage Gate with Risk Criteria Embedded

## Trigger
- New initiative / supplier onboarding / architecture gate requires risk evaluation (VS-00 embedded gates).

## Personas
- Portfolio/Change Governance (implicit)
- BU Risk Owner (per-003)
- Enterprise Risk Lead (per-002)
- Control Owner / Assurance (per-004)
- Finance/ExCo/Board (approval as required)

## Frontstage vs Backstage
| Step | Frontstage | Backstage | Systems | Data objects | Handoffs |
|------|------------|-----------|---------|--------------|----------|
| 1 | Gate initiated; scope selected (service/supplier) | Context prefetch (emerging risks, incidents, control health) | integrations, analytics | context_pack, incident_summary | portfolio → system |
| 2 | Risk pre-check shows within appetite / breach / waiver | Criteria model applied (versioned) | criteria_engine | risk_criteria_model_version | system |
| 3 | Risk owner completes/updates assessment | Evidence and assumptions enforced | workflow, evidence_vault | risk_assessment, evidence_item | bu_risk_owner → risk_lead |
| 4 | Control owner confirms control requirements | Control design checks | control_library | control, control_objective | control_owner → assurance |
| 5 | Decision recorded (proceed/conditions/stop/waiver) | Approval routing by thresholds | approvals | approval, decision_ledger_entry | risk_lead → governance/exco |

## Controls
- No gate completion without minimum evidence + assumptions + confidence for material scope.
- Criteria model version stamped on every decision.
- Waivers are timeboxed with expiry + conditions.

## Acceptance criteria
- Given a gate is initiated
  When criteria evaluation completes
  Then the system shows an unambiguous outcome (within tolerance / escalation / waiver required).

- Given a material assessment is submitted
  When evidence minimums are not met
  Then submission is blocked or marked low-confidence with expiry (policy choice) and is auditable.

## NFR controls
- Auditability: decision ledger entries are immutable and link to underlying evidence.
- SoD: assessor cannot be sole approver; waiver approvals delegated.
- Retention: gate decision artefacts retained by policy class.
- Lineage: gate decision links to services/suppliers/objectives and the exact criteria model version used.
