# Antigravity Model Selection Strategy (Advanced)

This strategy document has been updated to reflect the specific 8-model catalog available in your Antigravity environment. Our goal remains: **Minimum Quota, Maximum Effectiveness.**

## The Model Catalog: Intelligence & Cost Mapping

| Platform Model Name | Intelligence Tier | Logical Cost | Ideal Use Case |
| :--- | :--- | :---: | :--- |
| **Gemini 3 Flash** | Standard | ⭐ | Routine edits, unit tests, CSS/HTML |
| **Gemini 3 Pro (Low)** | Enhanced | ⭐⭐ | Feature development, API creation |
| **Gemini 3 Pro (High)** | Advanced | ⭐⭐⭐ | Cross-file refactoring, large context |
| **GPT-OSS 120B (Medium)** | Research | ⭐⭐ | Documentation exploration, general R&D |
| **Claude Sonnet 4.5** | Premium | ⭐⭐⭐⭐ | Complex algorithmic coding |
| **Claude Sonnet 4.5 (Thinking)** | Critical | ⭐⭐⭐⭐⭐ | Deep debugging, logical analysis |
| **Claude Sonnet 4.6 (Thinking)** | Critical+ | ⭐⭐⭐⭐⭐⭐ | Hardest logic puzzles, security audits |
| **Claude Opus 4.5 (Thinking)**| Elite | ⭐⭐⭐⭐⭐⭐⭐| Critical architectural breakthroughs |

## Dynamic Model Registry

To ensure we never miss a new model or use a deprecated one, the Platform uses a **Self-Updating Registry** system.

### How it Works:
1.  **Registry Source**: `tools/models.json` is the source of truth.
2.  **Auto-Checks**: The `model-router.py` utility checks this registry before every recommendation.
3.  **Platform Sync**: By default, the system checks for a newer version of the registry every **24 hours**.
4.  **Manual Refresh**: You can force a refresh at any time via the `/select-model sync` command.

## Selection Logic: The "Why"

- **Prefer Flash for Commodity**: If the task is "Standard" (boilerplate, naming, basic logic), Flash is the mandated choice.
- **Thinking for Opaque Failure**: Only escalate to "Thinking" models when a bug's cause is not visible in the local context.
- **Opus is the 'Nuclear' Option**: Reserves Opus only for tasks that have failed on lower "Thinking" tiers.

## Proactive Internal Governance (Agent-Led)

To eliminate the need for you to manually run checks, I (Antigravity) follow these internal governance rules:

1.  **Complexity Analysis**: Before starting any task classified as `EXECUTION` in my checklist, I run an internal check against the `model-router.py`.
2.  **Quota Guardrails**: If I detect a model mismatch (e.g., using Opus for a README fix), I will pause and recommend a downgrade to save your quota.
3.  **Intelligence Escalation**: If a task fails or produces errors on a lower tier, I will automatically suggest the specific "Thinking" model required to solve the impasse.
