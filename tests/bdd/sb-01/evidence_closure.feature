Feature: Evidence, Actions, and Closure
  As an Incident Lead and Risk Lead
  I want to capture evidence, manage actions, and close cases compliantly
  So that all governance requirements are met

  Background:
    Given a breach case in state "DecisionApproved"

  @E-04 @F-04-01 @S-10
  Scenario: Attach evidence to case
    Given I am logged in as Incident Lead
    When I attach evidence with type "document" and uri "https://storage/evidence/EV-001.pdf"
    Then an EvidenceItem is created with type, uri, uploaded_by, uploaded_at
    And EVIDENCE_ATTACHED audit event is emitted

  @E-04 @F-04-02 @S-11
  Scenario: Evidence policy gates DecisionApproved
    Given the case is High severity
    And required evidence is not attached
    When I attempt to transition to "DecisionApproved"
    Then the transition is blocked
    And an error message indicates missing evidence

  @E-04 @F-04-03 @S-12
  Scenario: Create and complete action items
    Given I am logged in as Incident Lead
    When I create an action item with owner "john.doe@example.com" and title "Fix valve"
    Then ACTION_CREATED audit event is emitted
    When the action is completed with completion_evidence_refs ["EV-002"]
    Then ACTION_COMPLETED audit event is emitted

  @E-04 @F-04-04 @S-13
  Scenario: Close case with post-action review
    Given all actions are completed
    And evidence policy is satisfied
    And I am logged in as Risk Lead
    When I close the case with review note "Root cause identified, training updated"
    Then the case transitions to "Closed"
    And CASE_CLOSED audit event is emitted
