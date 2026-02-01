## VS-02 — Risk Identification

| Section | Content |
| --- | --- |
| Customers / stakeholders | Risk Owners, BU leadership, Risk Function, Change teams, Procurement, Security |
| Purpose (value) | Produce a structured, linked, owned risk inventory that is actionable and portfolio-ready. |
| Triggers | Periodic cycle, new initiative, post-incident review, regulatory request, emerging risk flagged (VS-01). |
| Inputs | Context packs (VS-01), workshop outputs, incident learnings (VS-09), org/service maps, supplier lists. |
| DoR | Taxonomy approved; risk statement standard; ownership model active; linking targets (objectives/services/3rd parties) available. |
| Key activities | 1) Execute identification methods (workshops, interviews, data mining)<br>2) Draft cause–event–impact statements<br>3) Classify to taxonomy<br>4) Assign owners and reviewers<br>5) Link to objectives/KPIs, services/assets, suppliers<br>6) Identify duplicates and consolidate<br>7) Triage materiality/urgency<br>8) Queue for assessment (VS-03) |
| Decisions & gates | D1 Risk acceptance into portfolio (Risk Function)<br>D2 Ownership confirmation (BU Head)<br>D3 Materiality triage threshold (Risk Committee criteria) |
| Outputs | Normalised risk records; ownership; dependency links; triage status; assessment backlog entries. |
| DoD | Risks meet quality standards; duplicates resolved; owners confirmed; assessment scheduled; traceability links established. |
| Metrics | Flow: time from identification to triage; throughput of risks normalised; WIP of unowned risks.<br>Performance: % risks meeting quality standard; duplication rate.<br>Risk: proportion of material risks lacking assessment schedule. |

```mmd
classDiagram
  class Input1_contextPacksVs01
  class Activity1_1ExecuteIdentificationMethods
  class Activity2_2DraftCauseEvent
  class Activity3_3ClassifyToTaxonomy
  class Activity4_4AssignOwnersAnd
  class Activity5_5LinkToObjectives
  class Activity6_6IdentifyDuplicatesAnd
  class Activity7_7TriageMaterialityUrgency
  class Activity8_8QueueForAssessment
  class Output1_normalisedRiskRecords
  class Output2_ownership
  class Output3_dependencyLinks
  class Output4_triageStatus
  class Output5_assessmentBacklogEntries
  Input1_contextPacksVs01 "1" --> "0..*" Activity1_1ExecuteIdentificationMethods : feeds
  Activity1_1ExecuteIdentificationMethods --> Activity2_2DraftCauseEvent
  Activity2_2DraftCauseEvent --> Activity3_3ClassifyToTaxonomy
  Activity3_3ClassifyToTaxonomy --> Activity4_4AssignOwnersAnd
  Activity4_4AssignOwnersAnd --> Activity5_5LinkToObjectives
  Activity5_5LinkToObjectives --> Activity6_6IdentifyDuplicatesAnd
  Activity6_6IdentifyDuplicatesAnd --> Activity7_7TriageMaterialityUrgency
  Activity7_7TriageMaterialityUrgency --> Activity8_8QueueForAssessment
  Activity8_8QueueForAssessment --> Output1_normalisedRiskRecords : produces
  %% source: docs\value-architecture\value-streams\VS-02-risk-identification.md, generated: 2026-02-01T13:05:19.819061Z
```
