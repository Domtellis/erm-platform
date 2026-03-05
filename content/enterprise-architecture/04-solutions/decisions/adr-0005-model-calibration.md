# ADR 0005: Model Calibration & Feedback Loop

## Status
Accepted

## Last Updated
2026-03-05

## Context
AI models may drift or exhibit bias over time. To ensure the Accuracy and Relevance of suggestions, the system needs a structured way to learn from expert human decisions.

With the S-AIR architecture, a second calibration axis has been introduced: **Standards Drift Calibration**. This detects when AI citation patterns diverge from current ILO/ISO publication content, separately from the human override rate.

## Decision
We implement a **Closed-loop Model Calibration** mechanism with two feedback channels:

1. **Human Override Calibration** — captures Risk Lead Accept/Override decisions as ground-truth data for prompt tuning.
2. **Standards Drift Calibration** — monitors `unable_to_cite_reason` rates and `SyncLog` staleness to detect when the standards registry no longer matches the AI's applied knowledge.

## Rationale

### Channel 1: Human Override Calibration
- **Continuous Improvement**: Provides ground-truth data to tune prompts and future fine-tuning efforts.
- **Bias Detection**: High override rates for specific risk categories (e.g., `fatigue_rest_violation_rate`) trigger architectural bias reviews.
- **Transparency**: Creates a "Human-to-AI Agreement" metric that builds stakeholder trust.

### Channel 2: Standards Drift Calibration (S-AIR)
- **Standards Accuracy**: If the `unable_to_cite_reason` field on `AssessmentSuggestion` is populated at >10% for a given metric, this signals that either:
  - The ILO clause mapping for that metric tag is missing or incorrectly tagged, **or**
  - Gemini's pre-trained ISO knowledge is diverging from the injected ILO clauses (standards drift)
- **Sync Freshness**: `SyncLog.status = 'stale'` is treated as a calibration signal — the AI Oversight Lead investigates the ILO publication for amendments and updates the seed data accordingly.
- **Temporal Traceability**: The `StandardSnapshot` entity records exactly which clause versions were applied to each assessment, enabling post-hoc analysis of how citation quality changed over time.

## Consequences
- Every human override MUST require a rationale (textual feedback).
- A `HumanFeedbackLog` entity is added to the Audit & Reporting bounded context.
- The `erm-ai-risk-service` must expose an endpoint to ingest feedback associated with suggestion IDs.
- A monthly calibration report must include:
  - Human-to-AI Agreement Rate (by metric category)
  - `unable_to_cite_reason` rate (by metric tag)
  - Standards registry freshness (`SyncLog.last_checked_at`)
  - `StandardSnapshot` coverage rate (% of assessments with a snapshot)
- Standards Drift incidents (unable_to_cite_reason > 10% for a metric) must trigger a Jira ticket to the Compliance team for registry update.
