# Intelligent ERM Threat Model (Safety Focus)

This document identifies specific threats to the ERM Platform, with a particular focus on the automated monitoring and AI assessment layers.

## 1. AI-Specific Threats (Gemini 2.0 Integration)

| ID | Threat | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| T-AI-01 | **Prompt Injection** | Adversary bypasses risk guardrails via malicious breach descriptions. | Mandatory human-in-the-loop review; Prompt sanitization; Zero-anchoring validation. |
| T-AI-02 | **Model Evasion** | Minor tweaks to breach data cause AI to under-estimate high-risk events. | Monthly counterfactual testing; Disagreement tracking alerts. |
| T-AI-03 | **Synthetic Data Poisoning** | Expert panel bias is baked into the validation set. | Diverse multi-BU expert panels; Blind assessment procedures. |
| T-AI-04 | **Training Data Leakage** | PII or trade secrets sent to external LLM. | PII scrubbing layer (scrub-by-default); Contractual DPA with Google. |

## 2. Infrastructure & Pipeline Threats

| ID | Threat | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| T-INF-01 | **Audit Log Tampering** | Concealment of regulatory breaches. | Append-only database; Cryptographic hashing of events. |
| T-INF-02 | **Notification Surface Attack** | SMS/Email/Jira spam or phishing. | Auth-at-the-edge for Notification Service; Whitelisted recipients only. |
| T-INF-03 | **Control Bypass** | State transitions executed without required evidence. | OPA-enforced state machine (everything-as-code). |
