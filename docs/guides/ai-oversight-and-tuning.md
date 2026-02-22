# AI Oversight Lead Guide: Calibration & Tuning

## 1. Overview
As the **AI Oversight Lead**, you are responsible for the accuracy, fairness, and safety of the Gemini-powered risk assessments.

## 2. Weekly Calibration Workflow
1.  **Review Disagreements**: Filter the Breach List for "Disagreements Only".
2.  **Analyze Feedback**: Read the Risk Lead's rationale for why they modified an AI suggestion.
3.  **Calibrate**: If a systematic error is detected (e.g., under-rating a specific site), initiate a **Prompt Update** in the AI Risk Service.

## 3. Bias Monitoring (Monthly)
1.  **Run Counterfactuals**: Execute the monthly bias test suite.
2.  **Evaluate Drift**: Compare this month's agreement rate against the 99% target.
3.  **Report**: Log any incidents in the `ai-governance-log.md`.

## 4. Prompt Engineering
- The system uses **Zero-Shot + Reasoning** (gemini-2.0-flash).
- The **gemini-2.0-flash** model generates a chain-of-thought before the final risk score.
- Always include **ISO 45001** citations in the system prompt for auditability.
