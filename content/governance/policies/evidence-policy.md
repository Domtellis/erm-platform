# Evidence Collection & Integrity Policy

**Purpose**: Define the mandatory evidence requirements for all risk decisions within the ERM.

## 1. High-Integrity Evidence (HIE) Requirements

Every Breach Case must be supported by a "High-Integrity Evidence Bundle" before it can be closed.

| Evidence Type | Category | Standard | Reliability Score |
| :--- | :--- | :--- | :--- |
| **Sensor Data** | Technical | NIST SP 800-209 | High |
| **Photo/Video** | Observational | ISO 45001 §8.1 | Medium |
| **Witness Statement** | Human | ISO 45001 §9.1 | Medium |
| **AI Rationale** | Intelligent | ISO 42001 | Low (Supportive Only) |

## 2. AI-Assisted Evidence Generation

AI-generated summaries and risk suggestions are classified as **Decision Support Artifacts**. They cannot serve as the *sole* evidence for a High or Critical decision.

### Mandatory Metadata
All evidence records must include:
- `evidence_timestamp` (ISO 8601)
- `integrity_hash` (SHA-256)
- `collector_id` (User or Service ID)

## 3. Gating Rules
- **Decision Submission**: Blocked unless at least ONE "Technical" or "Observational" evidence artifact is attached.
- **High Severity Approval**: Blocked unless a Root Cause Analysis (RCA) artifact is attached.
