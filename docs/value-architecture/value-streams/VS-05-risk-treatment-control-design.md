## VS-05 — Risk Treatment and Control Design

| Section | Content |
| --- | --- |
| Customers / stakeholders | Risk Owners, Control Owners, Delivery teams, Procurement, Architecture/Change governance |
| Purpose (value) | Convert priority risks into effective treatments and control designs, with measurable effectiveness and acceptance conditions. |
| Triggers | Unacceptable residuals, required treatments from VS-04, new control requirements, incident learnings. |
| Inputs | Prioritised backlog (VS-04), control performance gaps (VS-06), KRIs (VS-07), obligations/compliance needs. |
| DoR | Target residual defined; delivery owner and funding identified; control standards available; dependencies mapped. |
| Key activities | 1) Select response option (avoid/reduce/transfer/accept);<br>2) Design control set (prevent/detect/correct; key controls);<br>3) Define control objectives and evidence/test approach;<br>4) Break into delivery work (epics/stories);<br>5) Implement via change/project pathways;<br>6) Verify completion and evidence;<br>7) Reassess residual delta;<br>8) Record acceptance with expiry/conditions where needed. |
| Decisions & gates | D1 Treatment selection and funding (Risk Owner + Portfolio/ExCo thresholds);<br>D2 Control design approval (Control Owner + 2nd line);<br>D3 Residual acceptance (delegated authority). |
| Outputs | Treatment plans, control designs, delivery backlog items, updated residuals, acceptance records with conditions/expiry. |
| DoD | Treatments implemented; evidence captured; residual reassessed; acceptance recorded; monitoring/assurance hooks set. |
| Metrics | Flow: treatment lead time; throughput; WIP of overdue treatments.<br>Performance: % delivered on time; verification pass rate.<br>Risk: residual reduction achieved; acceptance expiry breaches. |

## Conceptual diagram

```mmd
classDiagram
class RiskAppetiteStatement
class ToleranceThreshold
class RiskCriteriaModelVersion
class EscalationRule
class DecisionGate
class WaiverException
class Approval
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


```mmd
classDiagram
  class Input1_prioritisedBacklogVs04
  class Activity1_1SelectResponseOption
  class Activity2_2DesignControlSet
  class Activity3_keyControls
  class Activity4_3DefineControlObjectives
  class Activity5_4BreakIntoDelivery
  class Activity6_5ImplementViaChange
  class Activity7_6VerifyCompletionAnd
  class Activity8_7ReassessResidualDelta
  class Activity9_8RecordAcceptanceWith
  class Output1_treatmentPlansControlDesigns
  Input1_prioritisedBacklogVs04 "1" --> "0..*" Activity1_1SelectResponseOption : feeds
  Activity1_1SelectResponseOption --> Activity2_2DesignControlSet
  Activity2_2DesignControlSet --> Activity3_keyControls
  Activity3_keyControls --> Activity4_3DefineControlObjectives
  Activity4_3DefineControlObjectives --> Activity5_4BreakIntoDelivery
  Activity5_4BreakIntoDelivery --> Activity6_5ImplementViaChange
  Activity6_5ImplementViaChange --> Activity7_6VerifyCompletionAnd
  Activity7_6VerifyCompletionAnd --> Activity8_7ReassessResidualDelta
  Activity8_7ReassessResidualDelta --> Activity9_8RecordAcceptanceWith
  Activity9_8RecordAcceptanceWith --> Output1_treatmentPlansControlDesigns : produces
  %% source: docs\value-architecture\value-streams\VS-05-risk-treatment-control-design.md, generated: 2026-02-01T13:05:19.945166Z
```
