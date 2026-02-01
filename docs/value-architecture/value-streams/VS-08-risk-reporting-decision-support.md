## VS-08 — Risk Reporting and Decision Support

| Section | Content |
| --- | --- |
| Customers / stakeholders | Board/ExCo, Risk Committee, Regulators/customers (as needed), Business Leaders |
| Purpose (value) | Provide coherent, decision-focused reporting and an audit-ready record of risk decisions and actions. |
| Triggers | Governance cadence, regulatory/customer requests, major incidents, portfolio changes. |
| Inputs | Portfolio data (VS-02, VS-07), decision ledger (VS-04, VS-00), evidence (VS-06), incidents (VS-09), treatments (VS-05). |
| DoR | Reporting templates and narrative standards defined; data products available; traceability rules enforced. |
| Key activities | 1) Standardise narrative and decision asks;<br>2) Produce portfolio views and trends;<br>3) Build decision packs with options and trade-offs;<br>4) Generate external assurance artefacts;<br>5) Provide traceability links;<br>6) Capture decisions and actions;<br>7) Validate “one version of truth”;<br>8) Improve reporting based on feedback. |
| Decisions & gates | D1 Board pack sign-off (Risk Committee chair/Service Owner);<br>D2 External disclosure approval (Legal/Compliance);<br>D3 Data certification (Data Owner). |
| Outputs | Board packs, dashboards, external assurance artefacts, decision logs, traceability graphs. |
| DoD | Packs delivered on time; decisions captured; traceability validated; stakeholder feedback logged. |
| Metrics | Flow: pack production cycle time; time to answer stakeholder queries.<br>Performance: stakeholder satisfaction; % reporting automated; disputes rate.<br>Risk: decision latency reduction; unresolved top risks visibility. |

```mmd
classDiagram
  class Input1_portfolioDataVs02
  class Activity1_1StandardiseNarrativeAnd
  class Activity2_2ProducePortfolioViews
  class Activity3_3BuildDecisionPacks
  class Activity4_4GenerateExternalAssurance
  class Activity5_5ProvideTraceabilityLinks
  class Activity6_6CaptureDecisionsAnd
  class Activity7_7ValidateOneVersion
  class Activity8_8ImproveReportingBased
  class Output1_boardPacksDashboardsExternal
  Input1_portfolioDataVs02 "1" --> "0..*" Activity1_1StandardiseNarrativeAnd : feeds
  Activity1_1StandardiseNarrativeAnd --> Activity2_2ProducePortfolioViews
  Activity2_2ProducePortfolioViews --> Activity3_3BuildDecisionPacks
  Activity3_3BuildDecisionPacks --> Activity4_4GenerateExternalAssurance
  Activity4_4GenerateExternalAssurance --> Activity5_5ProvideTraceabilityLinks
  Activity5_5ProvideTraceabilityLinks --> Activity6_6CaptureDecisionsAnd
  Activity6_6CaptureDecisionsAnd --> Activity7_7ValidateOneVersion
  Activity7_7ValidateOneVersion --> Activity8_8ImproveReportingBased
  Activity8_8ImproveReportingBased --> Output1_boardPacksDashboardsExternal : produces
  %% source: docs\value-architecture\value-streams\VS-08-risk-reporting-decision-support.md, generated: 2026-02-01T13:05:20.139117Z
```
