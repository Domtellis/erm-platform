# UX-ADR-0002: AI Transparency & Progressive Disclosure

## Status: Accepted
## Date: 2026-02-21
## Decision Makers: [UX Lead, AI Oversight Lead]

## Context
Displaying raw AI output can be overwhelming and can lead to "automation bias" where users blindly accept suggestions. We need a standard for showing AI reasoning that encourages critical review while minimizing cognitive load.

## Decision
Adopt a **"Thinking-First" Progressive Disclosure** pattern for all AI suggestions.

1.  **The Suggestion Card**: Display the Impact/Likelihood score and a 1-sentence summary prominently.
2.  **The "Reasoning" Drawer**: Hide the detailed step-by-step logic and citations behind a collapsed "View Reasoning" button.
3.  **Severity-Based Default**: 
    *   **Low/Medium**: Reasoning is collapsed by default.
    *   **High/Critical**: Reasoning is **auto-expanded** to force review of the logic.

## Rationale
- **Trust**: Showing the "Thinking" process builds trust in the AI's accuracy.
- **Explainability**: Citations ensure auditor confidence.
- **Cognitive Load**: Hiding complexity for Low-risk cases speeds up triage.

## Consequences
- **Positive**: Higher quality human-in-the-loop decisions for critical breaches.
- **Negative**: Adds UI complexity (requires a reasoning engine component).

## Related Decisions
- [ADR-0008: AI Model Selection](../../adrs/0008-ai-model-selection.md)
