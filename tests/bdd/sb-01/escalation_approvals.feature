Feature: Escalation, Decisioning, and Approvals
  As a Risk Lead and BU Risk Owner
  I want to submit decisions and enforce SoD approvals
  So that High severity breaches are properly governed

  Background:
    Given a breach case with computed_severity "High"
    And the case is in state "Evaluated"

  @E-03 @F-03-01 @S-07
  Scenario: Trigger escalation for High severity
    When the severity is computed as "High"
    Then ESCALATION_TRIGGERED audit event is emitted
    And a Teams notification is sent to "BU-01-Safety-Risk" channel

  @E-03 @F-03-02 @S-08
  Scenario: Submit decision with rationale and evidence
    Given I am logged in as Risk Lead
    When I submit decision "mitigate" with rationale "Implement corrective actions" and evidence_refs ["EV-001"]
    Then DECISION_SUBMITTED audit event is emitted
    And approval requests are created per approval-policy.yaml
    And APPROVAL_REQUESTED audit event is emitted

  @E-03 @F-03-03 @S-09
  Scenario: Approve High severity decision with SoD enforcement
    Given a decision is pending approval
    And I am logged in as BU Risk Owner
    And I am not the decision submitter
    When I approve the decision
    Then DECISION_APPROVED audit event is emitted with sod_check_passed=true
    And decision fields are locked

  @E-03 @F-03-03
  Scenario: SoD blocks self-approval
    Given a decision is pending approval
    And I am logged in as the decision submitter
    When I attempt to approve the decision
    Then the approval is rejected
    And an error message indicates SoD violation
