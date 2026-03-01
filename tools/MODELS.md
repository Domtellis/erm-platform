# SYSTEM CONTEXT: Antigravity IDE Orchestrator

## 1. Project Goal
Develop and maintain a dynamic, lifecycle-aware Model Orchestrator that routes IDE tasks to specific AI models based on semantic complexity, tier availability, and live quota limits.

## 2. Tech Stack & Environment
* **Language:** Python 3.x
* **Deployment:** Oracle Cloud Infrastructure (OCI) Compute Instances via Docker-Compose.
* **Key Components:**
  * `router.py`: The decision engine (Regex scoring, hard fails, graceful degradation).
  * `sync-daemon.py`: The live data fetcher (HTTP requests to local language server).
  * `models.json`: The live registry of available models and quotas.

## 3. Strict Development Constraints
* **No Subprocesses for HTTP:** Use native Python `urllib` instead of `curl.exe` to prevent disk I/O locks.
* **Hard Fails over Hallucinations:** If a task requires an Elite model and all quotas are 0.0, the script MUST exit (`sys.exit(1)`) rather than degrading to a Standard (Flash) model.
* **Regex Boundaries:** All keyword scoring must use `re.findall` with `\b` word boundaries to prevent substring collisions.

## 4. Current State & Checkpoint
*(Update this section whenever switching models)*
* **Last Completed Task:** Refactored `sync-daemon.py` to remove Windows/curl dependencies and implement native `urllib` HTTP requests.
* **Current Focus:** Executing Phase 1 of the deployment roadmap (Context Management).
* **Next Immediate Step:** Deploy `router.py` and `sync-daemon.py` into the workspace.