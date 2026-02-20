---
description: Select the most efficient Gemini/Claude model from the 10-model catalog.
---

1. Start by understanding the user's task or explicitly checking for registry updates.
2. If the user says "sync" or "refresh", run:
// turbo
```powershell
python tools/model-router.py --sync
```
3. Otherwise, run the recommendation engine:
// turbo
```powershell
python tools/model-router.py --task "<USER_TASK_DESCRIPTION>"
```
4. Based on the "Quota Impact" (stars) and "Recommendation", tell the user:
   - Which model to select in the Antigravity menu.
   - The rationale (Why) based on the "Description".
   - Remind them that an automated check is performed every 24 hours.
5. Ask the user if they want to proceed with that model.

### Proactive Internal Use (Agent-Led)
**Note**: To minimize your manual effort, I (Antigravity) will also run this check automatically whenever you start a new complex project task. If I detect a mismatch between your selected model and the task's complexity, I will proactively suggest a switch before proceeding.
