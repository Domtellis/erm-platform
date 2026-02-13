# ADR 0005: Delegated Authority & Approvals

## Status
Accepted

## Context
The SB-01 workflow (F-03-03) requires decisions to be approved by specific personas based on the severity of the breach. To avoid hard-coding these rules, we need a flexible "Delegated Authority Matrix."

## Decision
We will implement a **Matrix-Based Approval Engine**:

### 1. Segregation of Duties (SoD)
The system will enforce a hard rule: **The submitter of a decision cannot be the approver.** This check occurs at the API level (S-09).

### 2. Authority Levels
Approval rights are mapped to Personas/Levels rather than specific users:
*   **Low/Medium Severity**: Can be approved by the `Incident Lead` or `Risk Lead`.
*   **High Severity**: Must be approved by the `Business Unit (BU) Risk Owner`.
*   **Out of Appetite**: May require `ExCo/Board` notification/sign-off.

### 3. Delegation Logic
The engine will look up the required `Persona` for a given `Severity` + `Business Unit`. If the currently assigned `BU Risk Owner` is unavailable, the system supports a "Delegated Alternate" lookup.

### 4. Explicit Sign-off
Approvals are not just a bit-flip. Each approval record (`Approval_ID`) must contain:
*   `Approver_ID`
*   `Decision_ID`
*   `Outcome` (Approve/Reject)
*   `Comments` (Optional/Required based on Severity)
*   `Timestamp`

## Consequences

### Positive
*   **Compliance**: Built-in adherence to internal governance and SoD requirements.
*   **Flexibility**: Changing the thresholds for approval (e.g., moving Medium to BU Risk Owner) only requires a configuration update.

### Negative
*   **Workflow Bottlenecks**: High-severity cases can stall if the BU Risk Owner is unavailable.
*   **Data Complexity**: Maintaining the Authority Matrix requires its own (minimal) admin UI or config management.

## Implementation Notes
*   **RBAC Alignment**: This matrix must stay in sync with the platform's overall RBAC system.
*   **Audit Trail**: Every delegation or change in the matrix itself is an audit event.
