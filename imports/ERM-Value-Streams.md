# ERM Value Streams

_Converted from the provided Word document into GitHub Flavoured Markdown (GFM)._

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

## VS-09 — Learnings - Incidents and Near-Miss

| Section | Content |
| --- | --- |
| Customers / stakeholders | Ops/SOC/ITSM, Risk Function, Control Owners, ExCo (for material events) |
| Purpose (value) | Convert real events into improved risk understanding, controls, and KRIs; reduce recurrence. |
| Triggers | Incidents, near misses, outages, fraud, compliance breaches, safety events. |
| Inputs | ITSM/SOC incidents, RCA outputs, loss data, control performance, service impact metrics. |
| DoR | Event classification taxonomy; RCA standard; linkage rules to risks/controls; ownership and CAPA workflow. |
| Key activities | 1) Capture and classify event;<br>2) Contain and implement immediate mitigations;<br>3) Perform RCA and contributing factors analysis;<br>4) Identify control gaps/failures;<br>5) Create CAPA actions with owners and dates;<br>6) Validate closure effectiveness;<br>7) Update risks/assessments and KRIs;<br>8) Publish lessons learned. |
| Decisions & gates | D1 Severity designation (Ops + Risk);<br>D2 CAPA approval and funding (BU/ExCo thresholds);<br>D3 Closure verification (independent). |
| Outputs | Post-incident reviews, updated risk/control records, CAPA plans, updated KRIs, lessons learned library. |
| DoD | RCA completed; CAPA implemented and validated; risk posture updated; recurrence controls defined. |
| Metrics | Flow: time to RCA completion; CAPA closure cycle time.<br>Performance: learning adoption rate; verification pass rate.<br>Risk: recurrence rate; reduction in similar events; loss trend. |
