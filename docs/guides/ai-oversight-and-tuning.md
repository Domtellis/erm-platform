# AI Oversight Lead Guide: Calibration & Tuning

## 1. Overview
As the **AI Oversight Lead**, you are responsible for the accuracy, fairness, and safety of the Gemini-powered risk assessments, including their standards citations.

## 2. Weekly Calibration Workflow
1.  **Review Disagreements**: Filter the Breach List for "Disagreements Only".
2.  **Check Citations**: Verify the `ilo_clause_applied` and `iso_clause_applied` fields are populated. A high rate of `unable_to_cite_reason` indicates the metric tags in the Standards Registry may need updating.
3.  **Analyze Feedback**: Read the Risk Lead's rationale for why they modified an AI suggestion.
4.  **Calibrate**: If a systematic error is detected, initiate a review of the ILO clause summary in `ilo-port-2018-clauses.json`.

## 3. Bias Monitoring (Monthly)
1.  **Run Counterfactuals**: Execute the monthly bias test suite.
2.  **Check Standards Drift**: Review the latest `SyncLog` entries. If status is `stale`, escalate to the Compliance team for re-ingestion.
3.  **Evaluate Drift**: Compare this month's agreement rate against the 99% target.
4.  **Report**: Log any incidents in the `ai-governance-log.md`.

## 4. Standards Sync Management

### Checking Registry Health
```bash
curl http://localhost:3004/health/standards
```
A healthy response shows `"healthy": true` and `"sync_status": "ok"`.

### If "Standards Out of Sync" Warning Appears in UI

| Signal | Meaning | Action |
|---|---|---|
| `sync_status: "stale"` | ILO publication page has changed | Review ILO PDF; update summaries if content changed |
| `warning: "Registry is empty"` | No ILO clauses in DB | Run `npm run standards:seed` |
| `unable_to_cite_reason` in assessment | Metric not mapped to any ILO clause | Add `metric_tags` entry to seed JSON |

See: [Standards Ingestion Guide](./standards-ingestion-guide.md)

## 5. Prompt Engineering

- The system uses **RAG + Reasoning** (Gemini 2.0 Flash, prompt v2.0).
- ILO Port Code clause summaries are **injected verbatim** into every prompt where a matching clause exists.
- Gemini is instructed to cite the **ISO 45001/31000 clause it knows** from its own training.
- Always verify that `iso_clause_applied` references a real ISO clause ID (e.g., `ISO 45001:2018 Clause 6.1.2`).
- If Gemini is hallucinating clause IDs, update the prompt in `prompt.builder.ts` with stricter citation instructions.
