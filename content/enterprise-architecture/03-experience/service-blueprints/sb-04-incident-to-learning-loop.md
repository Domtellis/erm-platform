---
doc_type: service_blueprint
blueprint_id: sb-04-incident-to-learning-loop
value_streams: [VS-09, VS-07, VS-03]
last_updated: 2026-02-03
---

# Service Blueprint — Incident-to-Learning Loop

## Trigger
- Incident or near miss captured (VS-09).

## Personas
- Incident & Monitoring Lead (per-005)
- BU Risk Owner (per-003)
- Enterprise Risk Lead (per-002)
- Control Owner/Assurance (per-004)
| Step | Frontstage (user-visible) | Backstage (system/ops) | Systems | Data objects | Handoffs |
|------|---------------------------|------------------------|---------|--------------|----------|
| 1 | Incident captured and classified | RCA requirements evaluated based on severity | incident_mgmt, monitoring | incident, rca_requirement | system → incident_lead |
| 2 | RCA performed; CAPA actions created | Lineage established to root causes and failed controls | workflow, incident_mgmt | rca_log, capa_task | incident_lead → action_owners |
| 3 | **AI Calibration Performed** | **Human Feedback Capture** (Updates Gemini calibration based on incident outcome) | **erm-ai-risk-service**, analytics | **human_feedback_log**, model_tuning_event | incident_lead → system |
| 4 | CAPA verified; Risk reassessment triggered | System-wide update of risk ratings and indicator thresholds | workflow, decisioning | assessment_update, kri_tuning | system → risk_owner |

## Controls
- Severity designation gate (Ops + Risk for material events).
- CAPA approval/funding gate by thresholds.
- Independent closure verification required for defined severities.

## Acceptance criteria
- Given an incident is captured
  When severity is classified as material
  Then RCA is mandatory before closure.

- Given RCA is published
  When CAPA actions are created
  Then owners, due dates, and verification method are mandatory.

- Given CAPA effectiveness is verified
  When closure occurs
  Then the system triggers risk reassessment and indicator/control update requests and logs them.

## NFR controls
- Auditability: complete chain from incident → RCA → CAPA → verification → triggered updates.
- SoD: independent verification role required for closure.
- Retention: incident artefacts retained by policy.
- Lineage: links maintained to risks, controls, services, indicators, and decision records.
