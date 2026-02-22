# Bounded Context: Decisioning & Approvals

## Purpose
Own decisions, approval workflow, authority checks, and Separation of Duties (SoD) evaluation.

## Owned Entities (System of Record)
- **Decision**: The recorded outcome/response to a breach.
- **Approval**: The specific approval record including approver identity and role.

## Key Invariants
- **Separation of Duties (SoD)**: The Submitter of a decision cannot be the Approver.
- **AI-Suggestion Review**: Decisions based on `AssessmentSuggestion` must record an explicit "Accepted/Overridden" flag with a mandatory rationale for overrides.
- All approvals must be linked to a valid Authority Matrix entry.

## Outbound Events
- `DECISION_SUBMITTED`
- `APPROVAL_REQUESTED`
- `DECISION_APPROVED`
- `DECISION_REJECTED`

## Coupling & Dependencies
- Reads **Identity & Access** for user roles and authority levels.
- Consumes events from **Evidence & Provenance** to gate approvals based on evidence policy.
