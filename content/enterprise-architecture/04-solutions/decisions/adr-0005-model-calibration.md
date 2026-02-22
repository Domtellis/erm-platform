# ADR 0005: Model Calibration & Feedback Loop

## Status
Accepted

## Context
AI models may drift or exhibit bias over time. To ensure the Accuracy and Relevance of suggestions, the system needs a structured way to learn from expert human decisions.

## Decision
We will implement a **Closed-loop Model Calibration** mechanism that captures human feedback (Accepted vs. Overridden) as a dataset for model refinement.

## Rationale
- **Continuous Improvement**: Provides ground-truth data to tune prompts (Prompt Engineering) and future fine-tuning efforts.
- **Bias Detection**: High override rates for specific risk categories will trigger architectural bias reviews.
- **Transparency**: Creates a "Human-to-AI Agreement" metric that builds stakeholder trust.

## Consequences
- Every human override MUST require a rationale (textual feedback).
- A `HumanFeedbackLog` entity is added to the Audit & Reporting bounded context.
- The `erm-ai-risk-service` must expose an endpoint to ingest feedback associated with suggestion IDs.
