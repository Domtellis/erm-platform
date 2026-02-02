## VS-06 — Control Operation and Assurance

| Section | Content |
| --- | --- |
| Customers / stakeholders | Management, Internal/External Audit, Regulators/customers, Control Owners, Risk Function |
| Purpose (value) | Demonstrate control operation and effectiveness with evidence; manage issues and provide attestations/audit packs. |
| Triggers | Control schedules, audits, compliance obligations, customer assurance, control exceptions. |
| Inputs | Control library (VS-05), operational data sources, test plans, evidence standards, issues/CAPA. |
| DoR | Controls defined with frequency and evidence requirements; data sources onboarded; SoD and testing approach agreed. |
| Key activities | 1) Execute controls (manual/automated);<br>2) Capture evidence with provenance;<br>3) Test controls (design/operating);<br>4) Identify exceptions and open issues;<br>5) Drive remediation and validate closure;<br>6) Run attestation campaigns;<br>7) Coordinate audit requests and provide packs;<br>8) Feed control health back to risk assessments (VS-03/VS-07). |
| Decisions & gates | D1 Control exception approval (delegated authority);<br>D2 Issue severity and SLA assignment (2nd line);<br>D3 Closure validation sign-off (independent reviewer). |
| Outputs | Control performance data, test results, evidence records, issues/actions, attestations, audit/customer packs. |
| DoD | Controls executed to schedule; evidence meets quality rules; testing completed; issues tracked with validated closure; attestations recorded. |
| Metrics | Flow: time to evidence collection; issue remediation cycle time; throughput of attestations.<br>Performance: audit findings trend; cost of compliance per control; evidence automation rate.<br>Risk: key control failure rate; recurrence rate of control deficiencies. |

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
  class Input1_controlLibraryVs05
  class Activity1_1ExecuteControlsManual
  class Activity2_2CaptureEvidenceWith
  class Activity3_3TestControlsDesign
  class Activity4_4IdentifyExceptionsAnd
  class Activity5_5DriveRemediationAnd
  class Activity6_6RunAttestationCampaigns
  class Activity7_7CoordinateAuditRequests
  class Activity8_8FeedControlHealth
  class Output1_controlPerformanceDataTest
  Input1_controlLibraryVs05 "1" --> "0..*" Activity1_1ExecuteControlsManual : feeds
  Activity1_1ExecuteControlsManual --> Activity2_2CaptureEvidenceWith
  Activity2_2CaptureEvidenceWith --> Activity3_3TestControlsDesign
  Activity3_3TestControlsDesign --> Activity4_4IdentifyExceptionsAnd
  Activity4_4IdentifyExceptionsAnd --> Activity5_5DriveRemediationAnd
  Activity5_5DriveRemediationAnd --> Activity6_6RunAttestationCampaigns
  Activity6_6RunAttestationCampaigns --> Activity7_7CoordinateAuditRequests
  Activity7_7CoordinateAuditRequests --> Activity8_8FeedControlHealth
  Activity8_8FeedControlHealth --> Output1_controlPerformanceDataTest : produces
  %% source: docs\value-architecture\value-streams\VS-06-risk-control-operation-assurance.md, generated: 2026-02-01T13:05:19.980612Z
```
