# SYSTEM CONTEXT: Antigravity IDE Orchestrator

## 1. Project Goal
Develop and maintain a dynamic, lifecycle-aware Model Orchestrator that routes IDE tasks to specific AI models based on semantic complexity, tier availability, and live quota limits.

## 2. Tech Stack & Environment
* **Language:** Python 3.x
* **Deployment:** Oracle Cloud Infrastructure (OCI) Compute Instances via Docker-Compose.
* **Key Components:**
  * `model_router.py`: The decision engine (Regex scoring, hard fails, graceful degradation).
  * `sync_daemon.py`: The live data fetcher (HTTP requests to local language server).
  * `models.json`: The live registry of available models and quotas.
  * `ai-route.bat` / `ai-route.sh`: The executable wrappers for the Open Agent Manager.

## 3. Strict Development Constraints
* **Model Routing (CRITICAL):** To route a task to the correct AI model, execute the `./ai-route.sh` (or `ai-route.bat`) script in the root directory and pass the task description in quotes. You can also force a model tier by passing `/select-model TierName` inside the quotes.
* **No Subprocesses for HTTP:** Use native Python `urllib` instead of `curl.exe` to prevent disk I/O locks.
* **Hard Fails over Hallucinations:** If a task requires an Elite model and all quotas are 0.0, the script MUST exit (`sys.exit(1)`) rather than degrading to a Standard model.
* **Regex Boundaries:** All keyword scoring must use `re.findall` with `\b` word boundaries to prevent substring collisions.

## 4. Startup & Health Check
* **Initialization:** Every time a new session starts, the Agent should run .\ai-route.bat --sync (or ./ai-route.sh --sync) to ensure models.json is populated with live quotas.

* **Verification:** Run .\ai-route.bat "test" to verify the routing math and alias connectivity.

* **System Health:** If the sync fails or the models.json is missing, notify the user immediately before attempting any complex architectural tasks.

## 5. Current State & Checkpoint
*(Update this section whenever switching models)*
* **Last Completed Task:** Successfully deployed the full CI/CD pipeline, fixed the mathematical scoring multiplier, integrated the `/select-model` manual override, and created agent wrapper scripts.
* **Current Focus:** Testing the Open Agent Manager's ability to trigger the `ai-route` scripts autonomously.
* **Next Immediate Step:** Write a prompt in the Open Agent Manager asking it to "use ai-route to write a small script" to verify it reads this context file and executes the batch/bash script correctly.