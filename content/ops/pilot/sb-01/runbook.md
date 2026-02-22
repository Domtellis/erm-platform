# SB-01 Runbook — Safety Appetite Breach Response (BU-01)

## 1. Create/Detect breach case
- Manual: Incident Lead creates a case and sets initial details.
- Signal: Monitoring stub webhook creates/links the case.

## 2. Triage & AI Assistance (Incident Lead)
Required:
- severity (Low/Medium/High)
- location
- short impact summary
Action:
- **Review AI Suggestion**: Check automated risk suggestion (if generated).
- **Validate Rationale**: Ensure AI reasoning aligns with metrics.
- **Provide Feedback**: Accept/Modify AI suggestion; providing rationale for overrides.
- move state to Triaged

## 3. Validate against appetite (Risk Lead)
Required:
- select appetite statement version
- select threshold and enter measured value
- rationale (mandatory)
Action:
- evaluation performed; escalation may be triggered automatically

## 4. Escalation (System + Notification Service)
If severity is High or threshold evaluation indicates High:
- **Notification Service** alert (Email/Jira) is sent to `Safety-Risk-Leads`
- case moves to Escalated (or decision gate becomes mandatory)

## 5. Decision + approval
- Risk Lead submits decision (accept/mitigate/stop/waive) with rationale
- For High severity:
  - BU Risk Owner approval is mandatory
  - SoD enforced: approver cannot be the submitter
  - evidence must meet policy before approval

## 6. Action plan execution (Incident Lead)
- create action items (owners, due dates)
- attach completion evidence
- move to Monitoring as actions progress

## 7. Closure (Risk Lead)
Preconditions:
- evidence policy satisfied
- action items completed (for High)
Action:
- close case
- export audit pack (store reference as needed)

## 8. Exceptions
- Missing evidence: platform blocks DecisionApproved/Closed; attach required items first
- Approver unavailable: assign delegated BU Risk Owner (record in audit trail)
- Wrong severity: update severity during triage; platform logs change
