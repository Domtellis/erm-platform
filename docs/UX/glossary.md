---
doc_type: glossary
lighthouse: sb-01
version: 0.1.0
last_updated: 2026-02-07
---

# User-Facing Glossary — SB-01

## Purpose

This glossary defines user-facing terminology for the SB-01 Appetite Breach Response workflow. Use these terms consistently in UI labels, help text, and documentation.

---

## Core Terms

| Term | Definition | UI Usage |
|:-----|:-----------|:---------|
| **Breach Case** | A managed case representing a detected safety breach and its full lifecycle. | "Breach Case", "Case" |
| **Triage** | The initial assessment of a breach case to determine severity and routing. | "Triage", "Triage Case" |
| **Severity** | The impact level of a breach: Low, Medium, or High. | Chip: `HIGH`, `MEDIUM`, `LOW` |
| **Appetite Statement** | A governance-approved statement defining acceptable risk levels. | "Appetite Statement" |
| **Threshold** | A specific tolerance rule within an appetite statement. | "Threshold", "Tolerance" |
| **Evaluation** | The comparison of a measured value against a threshold. | "Evaluate", "Evaluation" |
| **Measured Value** | The actual value being compared to the threshold. | "Measured Value" |
| **Computed Severity** | The severity derived from threshold evaluation (vs triaged severity). | "Calculated Severity" |
| **Decision** | A formal response to a breach: Accept, Mitigate, Stop, or Waive. | "Decision" |
| **Approval** | The act of approving or rejecting a decision. | "Approve", "Reject" |
| **Escalation** | Routing a case to a higher authority (e.g., High → BU Risk Owner). | "Escalated", "Escalation" |
| **Evidence** | Supporting documents or artefacts attached to a case. | "Evidence", "Attachments" |
| **Action Item** | A corrective or preventive action resulting from a decision. | "Action", "Task" |
| **Audit Pack** | A exportable bundle containing the full governance narrative. | "Audit Pack", "Export" |

---

## Governance Terms

| Term | Definition | UI Usage |
|:-----|:-----------|:---------|
| **SoD (Segregation of Duties)** | The control ensuring the decision submitter cannot also approve. | Badge: "SoD ✓" / "SoD ✗" |
| **Delegated Authority** | The person authorised to approve decisions at a given severity. | "Approver" |
| **Evidence Policy** | Rules defining minimum evidence required for approval/closure. | "Evidence Requirements" |
| **SLA (Service Level Agreement)** | Time targets for triage, decision, and closure. | Timer: "Due in 2h" |

---

## Status Values

### Breach Case Status

| Status | User Label | Description |
|:-------|:-----------|:------------|
| `Detected` | Detected | Case created, awaiting triage |
| `Triaged` | Triaged | Triage complete, awaiting evaluation |
| `ValidatedAgainstAppetite` | Evaluated | Threshold evaluation complete |
| `Escalated` | Escalated | Routed to higher authority |
| `DecisionRecorded` | Decision Pending | Decision submitted, awaiting approval |
| `DecisionApproved` | Decision Approved | Approval complete |
| `ActionPlanActive` | Actions In Progress | Action plan being executed |
| `Monitoring` | Monitoring | Actions in progress, being tracked |
| `Closed` | Closed | Case resolved |

### Decision Types

| Type | User Label | Description |
|:-----|:-----------|:------------|
| `accept` | Accept | Accept the risk within appetite |
| `mitigate` | Mitigate | Take corrective action |
| `stop` | Stop | Cease the activity causing the breach |
| `waive` | Waive | Temporary exception with conditions |

---

## Evidence Types

| Type | User Label | Description |
|:-----|:-----------|:------------|
| `incident_report` | Incident Report | Formal incident documentation |
| `photo` | Photo | Visual evidence |
| `witness_statement` | Witness Statement | Testimony from witnesses |
| `risk_assessment` | Risk Assessment | Formal risk assessment |
| `rca` | Root Cause Analysis | RCA documentation |
| `corrective_action_proof` | Corrective Action Proof | Evidence of action completion |
| `other` | Other | Miscellaneous evidence |

---

## Abbreviations

| Abbreviation | Full Form |
|:-------------|:----------|
| BU | Business Unit |
| SoD | Segregation of Duties |
| SLA | Service Level Agreement |
| KRI | Key Risk Indicator |
| KCI | Key Control Indicator |
| RCA | Root Cause Analysis |
| CAPA | Corrective and Preventive Action |
