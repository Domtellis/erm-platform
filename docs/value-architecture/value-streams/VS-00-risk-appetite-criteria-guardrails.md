## VS-00 — Risk Appetite, Criteria, and Decision Guardrails

| Section | Content |
| --- | --- |
| Customers / stakeholders | Board/ExCo, Finance, Risk Function, Business Leaders, Portfolio/Change Governance, Procurement |
| Purpose (value) | Translate strategy into measurable tolerances and evaluation rules to drive consistent decisions and escalations. |
| Triggers | Strategy refresh, market expansion, material incident, risk concentration concerns, regulatory change. |
| Inputs | Strategy/OKRs, loss history, critical services, regulatory constraints, capital plans, risk taxonomy. |
| Entry criteria / DoR | Risk classes agreed; impact/likelihood scales defined; baseline risk posture available; sponsor for appetite sign-off. |
| Key activities | 1) Define appetite by risk class;<br>2) Convert to tolerances/thresholds;<br>3) Define risk criteria and scoring model (incl. velocity/vulnerability);<br>4) Align to KPIs and resource allocation;<br>5) Define escalation and acceptance rules;<br>6) Embed into stage gates (investment, architecture, suppliers);<br>7) Publish playbooks and decision templates;<br>8) Configure platform rules engine. |
| Decisions & stage gates | D1 Appetite statement (Board);<br>D2 Criteria/scoring model version (Risk Committee);<br>D3 Gate adoption (ExCo/Change Governance);<br>D4 Exception/waiver process (Risk + Legal). |
| Outputs | Appetite statement, scoring model configuration, escalation matrix, gate checklists, waiver workflows. |
| Exit criteria / DoD | Appetite and criteria published; embedded into at least 3 critical gates; breach workflow operational; first breach review executed. |
| Metrics | Flow: time to evaluate vs appetite; throughput of exceptions processed.<br>Performance: % decisions using criteria; decision consistency index; stakeholder satisfaction.<br>Risk: appetite breach rate; time to remediate; risk-adjusted performance indicators. |

```mmd
classDiagram
  class RiskAppetiteStatement
  class ToleranceThreshold
  class RiskCriteriaModelVersion
  class EscalationRule
  class DecisionGate
  class WaiverException
  class Approval
  class BreachCase
  class Risk

  RiskAppetiteStatement "1" --> "0..*" ToleranceThreshold : defines
  ToleranceThreshold "1" --> "1" RiskAppetiteStatement : belongsTo
  DecisionGate "1" --> "1" RiskCriteriaModelVersion : uses
  RiskCriteriaModelVersion "0..*" --> "0..*" DecisionGate : referencedBy
  EscalationRule "1" --> "0..*" BreachCase : routes
  BreachCase "1" --> "1" EscalationRule : routedBy
  DecisionGate "1" --> "0..*" WaiverException : hasWaiver
  WaiverException "1" --> "1" DecisionGate : grantedAgainst
  WaiverException "0..1" --> "1" Risk : relatesTo
  WaiverException "1" --> "0..*" Approval : approvedVia
  Approval "1" --> "1" WaiverException : approves
```
