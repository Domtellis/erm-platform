# AI Governance Log — SB-02 (ISO 45001 Risk Assessment)

This document serves as an immutable record of all significant architectural and model-related decisions, calibrations, and performance reviews for the AI Risk Assessment integration.

## 1. Compliance Baseline
- **Standard**: ISO 45001 (Occupational Health and Safety)
- **Primary Model**: Gemini 2.0 Flash (Experimental)
- **Fallback Model**: Gemini 1.5 Pro
- **Human-in-the-Loop Constraint**: 100% of "High" and "Critical" severity suggestions require human acceptance/modification before finalization.

## 2. Decision Log

| Date | Incident/Change | Impact | Reasoning | Approved By |
| :--- | :--- | :--- | :--- | :--- |
| 2026-02-18 | System Audit Identify Gaps | Critical | Found build-breaking omissions in `erm-ai-risk-service` and missing traceability. | Audit Panel |
| 2026-02-19 | Phase A Restoration | Major | Restored `OutboxModule`, `AiController`, and OTel metrics. | System Agent |
| 2026-02-20 | Phase B UX Integration | Medium | Enabled `AISuggestionCard` with manual feedback loop in Portal. | System Agent |
| 2026-02-20 | Traceability Patch | High | Linked SB-02 features to strategic PRDs in `07-prd-to-epic-feature.yaml`. | System Agent |

## 3. Performance Snapshots (Weekly Review)

| Period | Requests | Acceptance Rate | Latency (Avg) | Error Rate |
| :--- | :--- | :--- | :--- | :--- |
| 2026-W08 | 0 (Draft) | N/A | N/A | N/A |

## 4. Policy Exceptions & Incident Reports
*No incidents reported.*
