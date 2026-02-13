# ADR 0003: Evidence Provenance Model

## Status
Accepted

## Context
One of the core requirements (F-04-01) is to maintain high-integrity evidence for audit purposes. We need a way to ensure that any piece of evidence uploaded to the system is immutable, traceable to its source, and cannot be tampered with without detection.

## Decision
We will implement an **Immutability-First Evidence Model**:

### 1. Persistent Identifiers
Every piece of evidence receives a `Evidence_ID` (e.g., `EV-YYYY-XXXXXX`) that is unique and never reused.

### 2. Content Addressable Storage (Conceptual)
While initial storage might be generic (S3/Azure Blob/SharePoint), we will record a `SHA-256` hash of the file content at the moment of ingest. This hash is stored in our internal database and the audit log.

### 3. Metadata Gating
Evidence cannot be "orphaned." Every evidence item must be linked to at least one `Breach_ID` or `Action_ID`. At the point of upload, we capture:
*   `Uploaded_By` (Persona ID)
*   `Timestamp` (UTC)
*   `Source_URI` (Original location)
*   `Original_Filename`

### 4. Immutable Records
Once a case is closed, the link between the case and the evidence is frozen. Evidence cannot be deleted if it is referenced by a closed case.

## Consequences

### Positive
*   **High Audit Confidence**: Auditors can verify that the file they are looking at matches the file that was approved by comparing hashes.
*   **Clear Traceability**: No ambiguity about who provided what evidence and when.

### Negative
*   **Storage Overhead**: De-duplication (if the same file is uploaded twice) becomes more complex if we want to save space while maintaining separate audit trails.
*   **Rigidity**: Mistakes in uploading the "wrong" file require a formal "superseded" workflow rather than a simple delete/replace.

## Implementation Notes
*   **Verification**: The system will periodically re-hash files to ensure zero-bit rot or external tampering.
*   **Audit Pack**: The exported Audit Pack (F-05-02) will include a manifest of these hashes.
