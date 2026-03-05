# AI Governance Log — SB-02 (ISO 45001 Risk Assessment)

This document serves as an immutable record of all significant architectural and model-related decisions, calibrations, and performance reviews for the AI Risk Assessment integration.

## 1. Compliance Baseline
- **Standards**: ISO 45001:2018 (Occupational Health and Safety) + ISO 31000:2018 (Risk Management)
- **Port-Specific Layer**: ILO Code of Practice on Safety and Health in Ports (2018) — freely published
- **Primary Model**: Gemini 2.0 Flash (Experimental)
- **Fallback Model**: Gemini 1.5 Pro
- **AI Strategy**: RAG-grounded assessment (S-AIR) — dual-citation of ILO and ISO clauses required
- **Human-in-the-Loop Constraint**: 100% of "High" and "Critical" severity suggestions require human acceptance/modification before finalization.

## 2. Decision Log

| Date | Incident/Change | Impact | Reasoning | Approved By |
| :--- | :--- | :--- | :--- | :--- |
| 2026-02-18 | System Audit Identify Gaps | Critical | Found build-breaking omissions in `erm-ai-risk-service` and missing traceability. | Audit Panel |
| 2026-02-19 | Phase A Restoration | Major | Restored `OutboxModule`, `AiController`, and OTel metrics. | System Agent |
| 2026-02-20 | Phase B UX Integration | Medium | Enabled `AISuggestionCard` with manual feedback loop in Portal. | System Agent |
| 2026-02-20 | Traceability Patch | High | Linked SB-02 features to strategic PRDs in `07-prd-to-epic-feature.yaml`. | System Agent |
| 2026-03-05 | **S-AIR Architecture Upgrade** | **Critical** | Replaced hardcoded zero-shot prompt with RAG-grounded dual-citation system. ILO Port Code 2018 ingested as Port Context Registry. `PortContextClause`, `SyncLog`, `StandardSnapshot` models added. Every assessment now cites ILO + ISO clause IDs. AI cannot silently fallback — emits `erm.risk.standards-unavailable.v1` if registry is empty. See ADR-0011. | System Agent |

## 3. Performance Snapshots (Weekly Review)

| Period | Requests | Acceptance Rate | Latency (Avg) | Error Rate |
| :--- | :--- | :--- | :--- | :--- |
| 2026-W08 | 0 (Draft) | N/A | N/A | N/A |

## 4. Policy Exceptions & Incident Reports
*No incidents reported.*
