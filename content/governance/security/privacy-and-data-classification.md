# Privacy and Data Classification Policy (AI-Enhanced)

**Version:** 1.0.0  
**Aligned Standards:** GDPR, EU AI Act, ISO/IEC 42001

## 1. Information Classification Matrix

| Class | Examples | Handling | LLM Exposure |
| :--- | :--- | :--- | :--- |
| **Public** | Marketing, General Policy | Standard | Allowed |
| **Internal** | Training material, SOPs | Standard | Allowed |
| **Confidential** | Breach metadata, Audit logs | Encrypted at Rest | Masked/Scrubbed |
| **Restricted** | PII, Passwords, Trade Secrets | Zero-Trust | **REDACTED (Blocked)** |

## 2. The PII Scrubbing Baseline

To maintain compliance with the **EU AI Act**, all outbound requests to external AI APIs must pass through our **PII Scrubbing Layer**.

### Mandatory Scrubbing Rules:
- **Names/IDs**: Replace with `[ANON_USER_XX]`.
- **Phone/Email**: Replace with `[REDACTED_P_INFO]`.
- **Geocodes**: Generalize to nearest Sector (e.g., "Terminal 1").

## 3. AI Dataset Governance

Datasets used for "Synthetic Validation" or "Model Calibration" must:
1. Be stored in a segregated **Governance Vault**.
2. Be audited monthly for "Concept Drift".
3. Be removed if the underlying safety standard (ISO 45001) is deprecated.
