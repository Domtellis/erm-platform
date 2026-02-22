# Strategic Assumptions & Risks (Intelligent ERM)

This document tracks the core assumptions and strategic risks associated with the platform's vision and its transition to an AI-augmented architecture.

## 1. Core Assumptions
- **Engagement (HITL)**: We assume that Risk Owners will actively engage with AI suggestions rather than "rubber-stamping," maintaining the Human-in-the-Loop integrity.
- **Connectivity**: We assume that primary source systems (ITSM, SOC) will support eventually-consistent event streams for near-real-time triage.
- **Regulatory Acceptance**: We assume that regulators (ISO 45001 auditors) will accept AI-generated narratives provided they are verified and signed off by a competent human person.

## 2. Strategic Risks
| Risk ID | Description | Mitigation Strategy |
| :--- | :--- | :--- |
| **SR-01** | **AI Hallucination**: Model provides a confident but incorrect severity rating, leading to under-assessment of a major safety breach. | Mandatory Human-in-the-Loop (HITL) review gate for all AI suggestions (ADR 0004). |
| **SR-02** | **Model Bias/Drift**: Performance degrades over time as new types of breaches occur that were not in the initial few-shot set. | Closed-loop Calibration mechanism capturing human overrides as a tuning dataset (ADR 0005). |
| **SR-03** | **Data Sovereignty**: Usage of Google Gemini API (2.0 Flash) must comply with corporate data privacy and residency requirements. | Implementation of Semantic Filters and ensuring no fine-tuning/training on customer data without explicit consent. |
| **SR-04** | **Adoption Fatigue**: Users find AI feedback cycles overwhelming if the "Agreement Rate" is low, leading to system abandonment. | Targeted baseline of >85% agreement rate (KR OKR-Y1-H-KR2) and explicit feedback UI to capture "why" an override occurred. |
