## VS-07 — Risk Monitoring

| Section | Content |
| --- | --- |
| Customers / stakeholders | Ops leaders, Risk Owners, Risk Function, ExCo/Board |
| Purpose (value) | Keep risk posture current through indicators and breach workflows; trigger timely mitigation and escalation. |
| Triggers | KRI/KCI thresholds, anomaly detection, operational events, emerging risk signals. |
| Inputs | Appetite thresholds (VS-00), monitoring data feeds, incident signals, control health, supplier performance. |
| DoR | Indicator definitions approved; data sources connected; thresholds set; routing and escalation paths configured. |
| Key activities | 1) Define/maintain KRIs/KCIs linked to risks and appetite;<br>2) Build data pipelines and freshness checks;<br>3) Monitor dashboards and alerts;<br>4) Correlate signals and triage breaches;<br>5) Escalate and launch mitigations;<br>6) Update risk ratings or confidence;<br>7) Track recurrence and false alerts;<br>8) Improve indicator set and thresholds. |
| Decisions & gates | D1 Threshold approval (Risk + BU);<br>D2 Escalation decision (delegated authority);<br>D3 Rating recalibration approval (Risk Owner). |
| Outputs | Indicator catalogue, live dashboards, breach logs, mitigation actions, updated risk posture. |
| DoD | Monitoring live; breach workflow tested; response SLAs met; indicator improvement loop operating. |
| Metrics | Flow: time to detect/acknowledge/escalate; throughput of breach triage.<br>Performance: false alert rate; data freshness compliance.<br>Risk: breach recurrence; % leading indicators; residual movement triggered by evidence. |

```mmd
classDiagram
  class Input1_appetiteThresholdsVs00
  class Activity1_1DefineMaintainKris
  class Activity2_2BuildDataPipelines
  class Activity3_3MonitorDashboardsAnd
  class Activity4_4CorrelateSignalsAnd
  class Activity5_5EscalateAndLaunch
  class Activity6_6UpdateRiskRatings
  class Activity7_7TrackRecurrenceAnd
  class Activity8_8ImproveIndicatorSet
  class Output1_indicatorCatalogueLiveDashboards
  Input1_appetiteThresholdsVs00 "1" --> "0..*" Activity1_1DefineMaintainKris : feeds
  Activity1_1DefineMaintainKris --> Activity2_2BuildDataPipelines
  Activity2_2BuildDataPipelines --> Activity3_3MonitorDashboardsAnd
  Activity3_3MonitorDashboardsAnd --> Activity4_4CorrelateSignalsAnd
  Activity4_4CorrelateSignalsAnd --> Activity5_5EscalateAndLaunch
  Activity5_5EscalateAndLaunch --> Activity6_6UpdateRiskRatings
  Activity6_6UpdateRiskRatings --> Activity7_7TrackRecurrenceAnd
  Activity7_7TrackRecurrenceAnd --> Activity8_8ImproveIndicatorSet
  Activity8_8ImproveIndicatorSet --> Output1_indicatorCatalogueLiveDashboards : produces
  %% source: docs\value-architecture\value-streams\VS-07-risk-monitoring.md, generated: 2026-02-01T13:05:20.040725Z
```
