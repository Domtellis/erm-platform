## VS-01 — Risk Sensing

| Section | Content |
| --- | --- |
| Customers / stakeholders | Risk Function, Business Leaders, Security, Ops, Compliance/Legal, Strategy teams |
| Purpose (value) | Maintain a continuously refreshed context so risk work is evidence-driven and timely. |
| Triggers | External shocks, regulatory change, supplier disruption, material trends in incidents, threat intel updates. |
| Inputs | Threat intel, regulatory feeds, macro indicators, Incidents, audit findings, complaints, supplier performance. |
| DoR | Defined sensing scope and sources, data access approvals, and triage rules. |
| Key activities | 1) Define sensing scope and critical dependencies<br>2) Ingest external signals<br>3) Ingest internal operational signals<br>4) Consult stakeholders and validate implications<br>5) Update context assumptions and dependency maps<br>6) Publish emerging risk watchlist |
| Decisions & gates | D1 Source onboarding approval (Security/Data);<br>D2 Emerging risk designation (Risk Committee);<br>D3 Trigger deep-dive assessment (Risk + BU owners). |
| Outputs | Sensing dashboard, emerging risk list. |
| DoD | Sources live with freshness SLAs; triage rules tested; emerging risks reviewed on cadence; context packs used in assessments. |
| Metrics | Flow: signal-to-triage time; triage throughput; WIP of unreviewed signals.<br>Performance: relevance score of signals; stakeholder utilisation.<br>Risk: “surprise events” count; % emerging risks reviewed. |

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
  class Input1_threatIntelRegulatoryFeeds
  class Activity1_1DefineSensingScope
  class Activity2_2IngestExternalSignals
  class Activity3_3IngestInternalOperational
  class Activity4_4ConsultStakeholdersAnd
  class Activity5_5UpdateContextAssumptions
  class Activity6_6PublishEmergingRisk
  class Output1_sensingDashboardEmergingRisk
  Input1_threatIntelRegulatoryFeeds "1" --> "0..*" Activity1_1DefineSensingScope : feeds
  Activity1_1DefineSensingScope --> Activity2_2IngestExternalSignals
  Activity2_2IngestExternalSignals --> Activity3_3IngestInternalOperational
  Activity3_3IngestInternalOperational --> Activity4_4ConsultStakeholdersAnd
  Activity4_4ConsultStakeholdersAnd --> Activity5_5UpdateContextAssumptions
  Activity5_5UpdateContextAssumptions --> Activity6_6PublishEmergingRisk
  Activity6_6PublishEmergingRisk --> Output1_sensingDashboardEmergingRisk : produces
  %% source: docs\value-architecture\value-streams\VS-01-risk-sensing.md, generated: 2026-02-01T13:05:19.774213Z
```
