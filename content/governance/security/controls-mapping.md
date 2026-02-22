# Technical Controls Mapping (ISO/NIST Baseline)

**Purpose**: Trace platform technical capabilities to regulatory and industry governance requirements.

## 1. Safety Control Mapping (ISO 45001)

| Requirement | Platform Control | Technical Enforcement |
| :--- | :--- | :--- |
| **Non-Conformity Management** | Breach Case Lifecycle | `05-product/sb-01/workflow-state-model.mmd` |
| **Evidence of Competence** | Risk Lead Certification | `governance/rbac/rbac-model.yaml` (capabilities) |
| **Participation & Consultation** | Incident Feedback Loop | `ai.calibration-feedback-captured` events |

## 2. AI Management Control Mapping (ISO 42001)

| Requirement | Platform Control | Technical Enforcement |
| :--- | :--- | :--- |
| **Risk Management Strategy** | Zero-Anchoring Prompts | `sb-02/features.yaml` (F-SB02-005) |
| **Transparency** | Explainable Rationale | `AssessmentSuggestion` schema (justification field) |
| **Human Oversight** | Approval Gating | `governance/decision-gates.yaml` |

## 3. Data Protection (EU AI Act / GDPR)

| Requirement | Platform Control | Technical Enforcement |
| :--- | :--- | :--- |
| **Data Minimization** | PII Scrubbing Layer | `security/privacy-and-data-classification.md` |
| **Right to Explanation** | AI Suggestion Rationale | UI `DecisioningCard` Component |
| **Audit Log Integrity** | Append-Only Logic | `audit-architecture.md` (Immutability Layer) |
