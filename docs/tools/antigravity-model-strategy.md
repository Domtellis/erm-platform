# Antigravity Model Selection Strategy (Advanced)

This strategy document has been updated to reflect the specific 8-model catalog available in your Antigravity environment. Our goal remains: **Minimum Quota, Maximum Effectiveness.**

## The Model Catalog: Intelligence & Cost Mapping

| Platform Model Name | Intelligence Tier | Logical Cost | Ideal Use Case |
| :--- | :--- | :---: | :--- |
| **Gemini 3 Flash** | Standard | ⭐ | Routine edits, unit tests, CSS/HTML |
| **Gemini 3.1 Pro (Low)** | Enhanced | ⭐⭐ | Feature development, API creation |
| **Gemini 3.1 Pro (High)** | Advanced | ⭐⭐⭐ | Cross-file refactoring, large context |
| **GPT-OSS 120B (Medium)** | Research | ⭐⭐ | Documentation exploration, general R&D |
| **Claude Sonnet 4.6 (Thinking)** | Critical | ⭐⭐⭐⭐⭐ | Deep debugging, logical analysis |
| **Claude Opus 4.6 (Thinking)** | Elite | ⭐⭐⭐⭐⭐⭐ | Critical architectural breakthroughs |

## ModelOps & Quota Policies

To ensure uninterrupted development during complex problem solving, the Platform employs automated Model Operations (ModelOps).

### Shadow Sync (Auto-Refresh)
The model registry automatically refreshes its "Ground Truth" status every 24 hours in a non-blocking background process. This ensures that any model provisioning changes in the Antigravity IDE are reflected without manual intervention.

### Graceful Degradation (Fallback Engine)
The recommendation engine monitors your remaining quota fraction for every model.
- **Buffer Zone (15%)**: If the ideal model (e.g., Pro High) is below 15% quota, the router automatically "steps down" to the next best available tier (e.g., Pro Low) for routine tasks.
- **Critical Override**: Use the `--critical` flag to bypass fallback and use the primary model even in the "Danger Zone" (<15%). This reserves the last 15% for your most important breakthroughs.

## Selection Logic: The "Why"

- **Prefer Flash for Commodity**: If the task is "Standard" (boilerplate, naming, basic logic), Flash is the mandated choice.
- **Thinking for Opaque Failure**: Only escalate to "Thinking" models when a bug's cause is not visible in the local context.
- **Opus is the 'Nuclear' Option**: Reserves Opus only for tasks that have failed on lower "Thinking" tiers.

## Proactive Internal Governance (Agent-Led)

To eliminate the need for you to manually run checks, I (Antigravity) follow these internal governance rules:

1.  **Complexity Analysis**: Before starting any task classified as `EXECUTION` in my checklist, I run an internal check against the `model-router.py`.
2.  **Quota Guardrails**: If I detect a model mismatch (e.g., using Opus for a README fix), I will pause and recommend a downgrade to save your quota.
3.  **Intelligence Escalation**: If a task fails or produces errors on a lower tier, I will automatically suggest the specific "Thinking" model required to solve the impasse.
