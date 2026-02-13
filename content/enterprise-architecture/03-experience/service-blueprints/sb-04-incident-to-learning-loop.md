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
