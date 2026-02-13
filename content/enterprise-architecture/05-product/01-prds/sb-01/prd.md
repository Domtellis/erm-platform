---
id: sb-01
name: Appetite Breach Response (Safety)
version: 0.1.0
status: draft
owner: Product
bu: BU-01
category: safety
---

# SB-01 PRD — Appetite Breach Response

## 1. Overview

### 1.1 Purpose
Deliver a thin, end-to-end workflow for **Safety breach response** when risk appetite thresholds are crossed. Key goals:
- Consistent triage and escalation
- Decisioning with delegated authority
- Evidence and approvals captured in-tool
- Audit-ready traceability from day 1

### 1.2 Problem Statement
Safety breaches are handled across email, chats, and spreadsheets, leading to:
- Inconsistent escalation and decisioning
- Missing evidence and unclear rationale
- Weak audit trails and poor repeatability
- Delays in corrective actions

### 1.3 Scope (MVP Pilot)
| Dimension | Scope |
| :--- | :--- |
| Business Unit | BU-01 |
| Category | Safety |
| Intake | Manual case creation + monitoring event stub |
| Notifications | Microsoft Teams |
| High Severity Approval | BU Risk Owner |

### 1.4 Personas
| Persona | Role |
| :--- | :--- |
| Incident Lead | Operator: creates, triages, attaches evidence |
| Risk Lead | Governance oversight: evaluates, submits decision |
| BU Risk Owner | Accountable approver for High severity |

---

## 2. User Journey

See: [Service Blueprint](../../../03-experience/service-blueprints/sb-01-appetite-breach-response.md)

| Step | Frontstage | Backstage | Key Events |
| :--- | :--- | :--- | :--- |
| 1 | Alert received | Ingestion validates freshness | `BREACH_CASE_CREATED` |
| 2 | Operator triages | Correlation enriches context | `CASE_TRIAGED` |
| 3 | Breach confirmed | Workflow routes case | `BREACH_CONFIRMED` |
| 4 | Mitigations launched | SLA timers; action tracking | `ACTION_CREATED` |
| 5 | Escalate if High | Route to BU Risk Owner | `ESCALATION_TRIGGERED` |
| 6 | Close with evidence | Post-review tasks | `CASE_CLOSED` |

---

## 3. Functional Requirements

### 3.1 Epics
→ See: [epics.yaml](../../02-backlog/sb-01/epics.yaml)

| Epic | Intent |
| :--- | :--- |
| E-01 | Breach case lifecycle (create, progress, manage) |
| E-02 | Appetite and threshold evaluation |
| E-03 | Escalation, decisioning, approvals, SoD |
| E-04 | Evidence, actions, closure |
| E-05 | Auditability and export |

### 3.2 Features
→ See: [features.yaml](../../02-backlog/sb-01/features.yaml)

### 3.3 Stories
→ See: [stories.yaml](../../02-backlog/sb-01/stories.yaml)

---

## 4. Non-Functional Requirements

### 4.1 SLAs
→ See: [slas.yaml](./slas.yaml)

| SLA | High | Medium | Low |
| :--- | :--- | :--- | :--- |
| Triage | 60 min | 3 hrs | 8 hrs |
| Decision | 8 hrs | 24 hrs | 48 hrs |
| Closure | 7 days | 14 days | 30 days |

### 4.2 Auditability
- Immutable event log for state transitions and approvals
- Evidence items include provenance + integrity hash
- All control events emitted per [audit-events-catalogue.yaml](../../../../governance/audit/audit-events-catalogue.yaml)

### 4.3 Segregation of Duties (SoD)
- Operators triage; delegated authority approves
- Approver ≠ Decision submitter for High severity
- Independent reviewer verifies closure for material cases

### 4.4 Evidence Policy
- High severity requires minimum evidence bundle before DecisionApproved/Closed
- Evidence items store type, URI, uploaded_by, uploaded_at

---

## 5. Data Model

→ See: [entities.yaml](../../../04-solutions/information-model/sb-01/entities.yaml)

Key entities: `BreachCase`, `BreachSignal`, `Evaluation`, `Decision`, `ActionItem`, `EvidenceItem`

---

## 6. Events

→ See: [events.yaml](../../../04-solutions/information-model/sb-01/events.yaml)

Key events: `BREACH_CASE_CREATED`, `CASE_TRIAGED`, `DECISION_APPROVED`, `CASE_CLOSED`, `AUDIT_PACK_EXPORTED`

---

## 7. API Contracts

→ See: [contracts/](../../../04-solutions/integrations/sb-01/contracts/)

- `breach-detected.schema.json` — Inbound breach signal schema

---

## 8. Success Metrics

→ See: [success-metrics.md](./success-metrics.md)

| Metric | Target |
| :--- | :--- |
| Time to Triage (p50) | ≤60 min |
| Time to Decision (p50) | ≤8 hrs |
| Evidence Completeness | ≥90% |
| In-tool Completion | ≥85% |

---

## 9. Acceptance Criteria

→ See: [acceptance-criteria.md](../../02-backlog/sb-01/acceptance-criteria.md)

---

## 10. Non-Goals (MVP)

→ See: [non-goals.md](./non-goals.md)

- ML-based recommendations
- Enterprise-wide taxonomy migration
- Full policy library management
- Complex quantitative risk models
- Multi-BU rollout automation
- Full ticketing integration
- Advanced dashboards

---

## 11. Definition of Done (MVP)

A Safety breach can be run **end-to-end in-tool**:
1. Detect/Create → Triage → Validate vs Appetite → Escalate
2. Decision + Approval → Action Plan → Evidence bundle
3. Close + Audit pack export

With:
- SoD, approvals, evidence requirements enforced (not optional)
- Workflow production-usable by BU-01 pilot users
