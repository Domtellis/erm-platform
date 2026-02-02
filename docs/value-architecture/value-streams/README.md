# ERM Value Streams Pack (VS-00 to VS-09)

Source of truth lives in this folder. Word/PDF exports (if needed) are in /exports.

## Value Streams
- [VS-00 — Risk Appetite, Criteria, and Decision Guardrails](./VS-00-risk-appetite-criteria-guardrails.md)
- [VS-01 — Risk Sensing](./VS-01-risk-sensing.md)
- [VS-02 — Risk Identification](./VS-02-risk-identification.md)
- [VS-03 — Risk Analysis](./VS-03-risk-analysis.md)
- [VS-04 — Risk Evaluation and Prioritisation](./VS-04-risk-evaluation-prioritisation.md)
- [VS-05 — Risk Treatment and Control Design](./VS-05-risk-treatment-control-design.md)
- [VS-06 — Control Operation and Assurance](./VS-06-control-operation-assurance.md)
- [VS-07 — Risk Monitoring](./VS-07-risk-monitoring.md)
- [VS-08 — Risk Reporting and Decision Support](./VS-08-risk-reporting-decision-support.md)
- [VS-09 — Learnings - Incidents and Near-Miss](./VS-09-learnings-incidents-near-miss.md)

---

## Automation
A generator script (`scripts/generate_value_streams.py`) will create/update `context.yaml` and `conceptual.mmd` artifacts under the matching `models/<NN>-<slug>/` folder for each `VS-*.md` file.

A GitHub Actions workflow (`.github/workflows/generate-value-streams.yml`) runs on pushes and pull requests when files under this folder change and will commit generated artifacts back to the repo.

If you need to run locally, install dependencies and run:

```bash
python -m pip install -r scripts/requirements.txt
python scripts/generate_value_streams.py
```


