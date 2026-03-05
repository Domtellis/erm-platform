---
doc_type: service_blueprint
blueprint_id: sb-02-stage-gate-risk-criteria
value_streams: [VS-00, VS-03, VS-04, VS-05]
last_updated: 2026-03-05
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
| 3 | Risk owner **validates AI-drafted** assessment | **AI-Assisted Assessment Drafting (S-AIR)**: `erm-ai-risk-service` retrieves matching ILO Port Code clauses from `PortContextClause` registry by metric tag, then instructs Gemini to cite the relevant ISO 45001/31000 sub-clause. Dual citation (`ilo_clause_applied` + `iso_clause_applied`) attached to `AssessmentSuggestion`. `StandardSnapshot` immutably records applied clause versions. If `standards_warning: true`, UI must surface this visibly before the Risk Owner can proceed. | workflow, **erm-ai-risk-service**, **Port Context Registry**, evidence_vault | risk_assessment, assessment_suggestion, standard_snapshot | bu_risk_owner → risk_lead |
| 4 | Control owner confirms control requirements | Control design checks | control_library | control, control_objective | control_owner → assurance |
| 5 | Decision recorded (proceed/conditions/stop/waiver) | Approval routing by thresholds | approvals | approval, decision_ledger_entry | risk_lead → governance/exco |

## Controls
- No gate completion without minimum evidence + assumptions + confidence for material scope.
- Criteria model version stamped on every decision.
- Waivers are timeboxed with expiry + conditions.
- AI assessments with `standards_warning: true` are HITL-mandatory — Risk Owner **cannot** self-approve without AI Oversight Lead counter-sign.

## Acceptance criteria
- Given a gate is initiated
  When criteria evaluation completes
  Then the system shows an unambiguous outcome (within tolerance / escalation / waiver required).

- Given a material assessment is submitted
  When evidence minimums are not met
  Then submission is blocked or marked low-confidence with expiry (policy choice) and is auditable.

- Given an AI assessment is generated
  When `standards_warning: true` or `unable_to_cite_reason` is populated
  Then the Risk Owner UI surfaces a visible warning and blocks auto-accept until a HITL review is recorded.

## NFR controls
- Auditability: decision ledger entries are immutable and link to underlying evidence.
- SoD: assessor cannot be sole approver; waiver approvals delegated.
- Retention: gate decision artefacts retained by policy class.
- Lineage: gate decision links to services/suppliers/objectives and the exact criteria model version used, including `StandardSnapshot` reference for AI-assisted decisions.

