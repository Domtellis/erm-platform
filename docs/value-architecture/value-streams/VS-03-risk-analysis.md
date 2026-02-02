## VS-03 — Risk Analysis

| Section | Content |
| --- | --- |
| Customers / stakeholders | Risk Owners, Risk Function, Finance, Security/Ops SMEs, ExCo/Board (for material risks) |
| Purpose (value) | Produce evidence-based understanding of exposure and drivers to support prioritisation and treatment design. |
| Triggers | Material risks, critical service reviews, board deep dives, initiative gates, appetite breaches. |
| Inputs | Risk records (VS-02), appetite/criteria (VS-00), control data (VS-06), KRI data (VS-07), loss/incidents (VS-09). |
| DoR | Chosen analysis method; required evidence sources identified; control mappings available; assumptions log template active. |
| Key activities | 1) Select analysis technique (tiered: quick qualification → detailed scenario)<br>2) Assess inherent likelihood/impact<br>3) Assess control design and operating effectiveness<br>4) Compute residual risk and confidence<br>5) Quantify exposure where required (ranges/scenarios)<br>6) Perform sensitivity/uncertainty review<br>7) Document evidence and assumptions<br>8) Submit for challenge/approval |
| Decisions & gates | D1 Method selection for material risks (Risk Function)<br>D2 Residual rating approval (Risk Owner + delegated authority thresholds)<br>D3 Quant model sign-off (Finance/Risk depending) |
| Outputs | Inherent/residual ratings, scenario analysis artefacts, quantified exposure bands, assumptions and evidence logs. |
| DoD | Assessment meets QA standard; evidence attached; assumptions recorded; approvals captured; next-step decision required identified. |
| Metrics | Flow: assessment cycle time; rework rate after challenge; WIP of assessments.<br>Performance: assessment QA score; % with evidence; consistency across BUs.<br>Risk: % material risks with quantified view (where policy requires); override frequency. |

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
  class Input1_riskRecordsVs02
  class Activity1_1SelectAnalysisTechnique
  class Activity2_2AssessInherentLikelihood
  class Activity3_3AssessControlDesign
  class Activity4_4ComputeResidualRisk
  class Activity5_5QuantifyExposureWhere
  class Activity6_6PerformSensitivityUncertainty
  class Activity7_7DocumentEvidenceAnd
  class Activity8_8SubmitForChallenge
  class Output1_inherentResidualRatingsScenario
  Input1_riskRecordsVs02 "1" --> "0..*" Activity1_1SelectAnalysisTechnique : feeds
  Activity1_1SelectAnalysisTechnique --> Activity2_2AssessInherentLikelihood
  Activity2_2AssessInherentLikelihood --> Activity3_3AssessControlDesign
  Activity3_3AssessControlDesign --> Activity4_4ComputeResidualRisk
  Activity4_4ComputeResidualRisk --> Activity5_5QuantifyExposureWhere
  Activity5_5QuantifyExposureWhere --> Activity6_6PerformSensitivityUncertainty
  Activity6_6PerformSensitivityUncertainty --> Activity7_7DocumentEvidenceAnd
  Activity7_7DocumentEvidenceAnd --> Activity8_8SubmitForChallenge
  Activity8_8SubmitForChallenge --> Output1_inherentResidualRatingsScenario : produces
  %% source: docs\value-architecture\value-streams\VS-03-risk-analysis.md, generated: 2026-02-01T13:05:19.857383Z
```
