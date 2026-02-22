## VS-01 — Risk Sensing

| Section | Content |
| --- | --- |
| Customers / stakeholders | Risk Function, Business Leaders, Security, Ops, Compliance/Legal, Strategy teams |
| Purpose (value) | Maintain a continuously refreshed context so risk work is evidence-driven and timely. |
| Triggers | External shocks, regulatory change, supplier disruption, material trends in incidents, threat intel updates. |
| Inputs | Threat intel, regulatory feeds, macro indicators, Incidents, audit findings, complaints, supplier performance. |
| DoR | Defined sensing scope and sources, data access approvals, and triage rules. |
| Key activities | 1) Define sensing scope and critical dependencies<br>2) Ingest external signals<br>3) **AI-Assisted Signal Enrichment** (NLP classification/clustering via Gemini API)<br>4) Ingest internal operational signals<br>5) Consult stakeholders and validate implications<br>6) Update context assumptions and dependency maps<br>7) Publish emerging risk watchlist |
| Decisions & gates | D1 Source onboarding approval (Security/Data);<br>D2 **Intelligence Validation** (Human verification of AI-tagged signals);<br>D3 Emerging risk designation (Risk Committee);<br>D4 Trigger deep-dive assessment (Risk + BU owners). |
| Outputs | Sensing dashboard, emerging risk list. |
| DoD | Sources live with freshness SLAs; triage rules tested; emerging risks reviewed on cadence; context packs used in assessments. |
| Metrics | Flow: signal-to-triage time; triage throughput; WIP of unreviewed signals.<br>Performance: relevance score of signals; **AI Signal Tagging Accuracy**; stakeholder utilisation.<br>Risk: “surprise events” count; % emerging risks reviewed. |


