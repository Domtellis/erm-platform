## VS-04 — Risk Evaluation and Prioritisation

| Section | Content |
| --- | --- |
| Customers / stakeholders | ExCo/Board, Risk Committee, Portfolio/Finance, Risk Owners |
| Purpose (value) | Turn assessed risks into prioritised decisions, funded treatments, and portfolio views (including concentrations/systemic risk). |
| Triggers | Completion of analysis, quarterly review, appetite breach, budget cycle. |
| Inputs | Residual risk results (VS-03), appetite/criteria (VS-00), monitoring and control health (VS-06/VS-07), strategic priorities. |
| DoR | Current risk portfolio with assessed residuals; appetite thresholds loaded; portfolio segmentation agreed (BU, region, risk class, service). |
| Key activities | 1) Evaluate residual vs appetite;<br>2) Rank and cluster (themes/systemic/concentration);<br>3) Identify single points of failure and critical service exposures;<br>4) Select response approach per risk;<br>5) Build prioritised treatment backlog;<br>6) Allocate owners and funding;<br>7) Set review cadence by volatility;<br>8) Publish portfolio decisions and actions. |
| Decisions & gates | D1 Portfolio prioritisation and funding (ExCo);<br>D2 Accept/avoid decisions for unacceptable risks (delegated authority/Board where required);<br>D3 Review cadence and top risk set (Risk Committee). |
| Outputs | Top risk portfolio, heatmaps, concentration view, funded treatment backlog, escalation log, decision ledger. |
| DoD | Priorities agreed; funding assigned; treatments created; escalations captured; reporting baseline established. |
| Metrics | Flow: decision lead time; throughput of funded treatments; WIP of unfunded high risks.<br>Performance: board clarity score; “one version of truth” disputes.<br>Risk: % high risks with funded plans; concentration indices; number of unresolved appetite breaches. |

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
  class Input1_residualRiskResultsVs
  class Activity1_1EvaluateResidualVs
  class Activity2_2RankAndCluster
  class Activity3_3IdentifySinglePoints
  class Activity4_4SelectResponseApproach
  class Activity5_5BuildPrioritisedTreatment
  class Activity6_6AllocateOwnersAnd
  class Activity7_7SetReviewCadence
  class Activity8_8PublishPortfolioDecisions
  class Output1_topRiskPortfolioHeatmaps
  Input1_residualRiskResultsVs "1" --> "0..*" Activity1_1EvaluateResidualVs : feeds
  Activity1_1EvaluateResidualVs --> Activity2_2RankAndCluster
  Activity2_2RankAndCluster --> Activity3_3IdentifySinglePoints
  Activity3_3IdentifySinglePoints --> Activity4_4SelectResponseApproach
  Activity4_4SelectResponseApproach --> Activity5_5BuildPrioritisedTreatment
  Activity5_5BuildPrioritisedTreatment --> Activity6_6AllocateOwnersAnd
  Activity6_6AllocateOwnersAnd --> Activity7_7SetReviewCadence
  Activity7_7SetReviewCadence --> Activity8_8PublishPortfolioDecisions
  Activity8_8PublishPortfolioDecisions --> Output1_topRiskPortfolioHeatmaps : produces
  %% source: docs\value-architecture\value-streams\VS-04-risk-evaluation-prioritisation.md, generated: 2026-02-01T13:05:19.905669Z
```
