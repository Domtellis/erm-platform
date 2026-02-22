---
doc_type: service_blueprint
blueprint_id: sb-01-appetite-breach-response
value_streams: [VS-07, VS-00, VS-09]
last_updated: 2026-02-03
---

# Service Blueprint — Appetite Breach Response

## Trigger
- KRI/KCI threshold crossed or anomaly detected (VS-07).
- Breach evaluated against appetite tolerances (VS-00).

## Personas
- Incident & Monitoring Lead (per-005)
- BU Risk Owner (per-003)
- Enterprise Risk Lead (per-002)
- Board/ExCo Member (per-001) — escalation only

## Preconditions (Definition of Ready)
- Indicator definitions approved; routing paths configured; data freshness checks active.
- Appetite thresholds and escalation rules published.

## Frontstage vs Backstage

| Step | Frontstage (user-visible) | Backstage (system/ops) | Systems | Data objects | Handoffs |
|------|---------------------------|------------------------|---------|--------------|----------|
| 1 | Alert received; operator opens alert | Ingestion validates freshness and integrity | ingestion, monitoring | alert, indicator_definition | system → incident_monitoring_lead |
| 2 | Operator triaged; **AI suggests score** | AI Risk Service enriches with Gemini; Correlation groups signals | ingestion, **erm-ai-risk-service** | alert, **AssessmentSuggestion** | system → incident_monitoring_lead |
| 3 | Breach confirmed; breach case created | Workflow engine routes case and starts SLAs | workflow, notification | breach_case, escalation_rule | bu_risk_owner → enterprise_risk_lead |
| 4 | Mitigation actions launched | SLA timers; action tracking; reminders | workflow, task mgmt | mitigation_action | bu_risk_owner → action_owners |
| 5 | Escalate if beyond tolerance | Route to delegated authority / ExCo / Board | workflow, approvals | approval, waiver_exception (if needed) | enterprise_risk_lead → exco/board |
| 6 | Verify mitigation; **Provide Feedback** | Post-review tasks; **AI Feedback Capture** | analytics, reporting | evidence_item, **human_feedback_log** | system → reporting |

## Failure points and controls
- False positives flood → control: correlation + tuning loop + false alert metric.
- Stale data → control: freshness gate blocks/flags and prevents “confirmed breach” without exception record.
- Misrouting → control: rule versioning + test harness + audit of routing decisions.
- “Waiver as bypass” → control: waivers require rationale + evidence + expiry + delegated approval.

## Evidence generation
- Triage record, correlation context, mitigation evidence, verification evidence.
- Integrity hashes on evidence items; provenance fields mandatory.

## Approval chain
- Threshold approval: Risk + BU (indicator level).
- Escalation/acceptance: delegated authority based on tolerance breach.
- Waiver: Risk + Legal/Compliance where policy requires; expiry mandatory.

## Audit logging (minimum)
- alert_triaged, breach_confirmed, breach_case_opened, breach_case_escalated, mitigation_launched, mitigation_verified, breach_case_resolved.
- Include actor_role, criteria_model_version, escalation_rule_ref, evidence_set_hash.

## Acceptance criteria (Gherkin)
- Given an indicator is live and freshness checks pass
  - When a threshold is breached
  - Then an alert is created and routed within SLA.

- Given an alert is triaged as confirmed
  - When the breach is beyond tolerance
  - Then a breach case is escalated to the correct authority and logged.

- Given mitigation actions are completed
  - When verification evidence is attached
  - Then the breach case can be resolved and post-review tasks created.

## Non-functional controls
### Auditability
- Immutable event log for state transitions and approvals.
- Evidence items include provenance + integrity hash.

### Segregation of duties (SoD)
- Operators can triage; delegated authority approves waivers/acceptance; independent reviewer verifies closure for material cases.

### Retention
- Evidence retention classes (e.g., regulatory, audit, operational) enforced by policy.
- Legal hold support for disclosures/incidents.

### Lineage
- Every breach case links to: indicator_definition → source data product(s) → risk(s) → decisions/actions.
- Certification-grade lineage report available for governance cycles.

### Security & privacy (baseline)
- RBAC + ABAC on sensitive incidents and disclosures.
- Tamper-evident audit log; encryption at rest/in transit.

### Performance/availability (baseline)
- Alert ingestion and routing tiered SLAs; graceful degradation if enrichment fails (case still opened with “pending links”).
