# Enterprise Risk Appetite Statement (ERM 2026)

**Version:** 1.0.0  
**Status:** DRAFT - Requires CRO Approval  
**Aligned Standards:** ISO 31001, NIST AI RMF 2.0

## 1. Safety & Operational Risk (ISO 45001)

The platform operates on a **Zero Tolerance** basis for safety-critical failures.

| Breach Severity | Appetite Type | Retention | AI Threshold |
| :--- | :--- | :--- | :--- |
| **Critical** | Zero Appetite | 25 Years | Mandatory Human Override |
| **High** | Minimal Appetite | 15 Years | Expert Approval Required |
| **Medium** | Measured Appetite | 10 Years | Standard Approval |
| **Low** | Tolerable | 5 Years | Automated Completion |

## 2. AI & Automated Intelligence Risk

Our appetite for AI-assisted risk assessment is contingent on **Accountability and Transparency**.

- **Model Accuracy**: Minimum 85% agreement rate with human experts for High-risk events.
- **Explainability**: 100% of AI suggestions must include human-readable rationale citing industry standards.
- **Fairness**: Zero tolerance for systematic bias (Geographic, Temporal, or Severity-based).

## 3. Data Integrity & Privacy

- **Data Leakage**: Zero appetite for PII transmission to external LLM providers.
- **Traceability**: All decisions must maintain a 100% audit trail linking Evidence -> Assessment -> Approval.
