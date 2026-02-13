Feature: Breach Case Lifecycle
  As an Incident Lead
  I want to create and manage Safety breach cases
  So that breaches are consistently triaged and tracked

  Background:
    Given the system is configured for BU-01 Safety breaches
    And SLA timers are active per slas.yaml

  @E-01 @F-01-01 @S-01
  Scenario: Create Safety breach case manually
    Given I am logged in as Incident Lead
    When I create a new breach case with category "Safety"
    Then a BreachCase is created with status "Detected"
    And the case has a unique breach_case_id
    And a BREACH_CASE_CREATED audit event is emitted

  @E-01 @F-01-01 @S-02
  Scenario: Ingest breach-detected event via webhook
    Given a valid breach-detected payload
    When the webhook receives the event
    Then the payload is validated against breach-detected.schema.json
    And a BreachSignal is created and linked to a BreachCase
    And BREACH_SIGNAL_LINKED audit event is emitted

  @E-01 @F-01-02 @S-03
  Scenario: Enforce workflow state machine transitions
    Given a breach case in state "Detected"
    When I attempt to transition directly to "Closed"
    Then the transition is rejected
    And no state change event is emitted

  @E-01 @F-01-03 @S-04
  Scenario: Complete triage and start SLA clocks
    Given a breach case in state "Detected"
    And I am logged in as Incident Lead
    When I complete triage with severity "High" and location "Site-A"
    Then the case transitions to "Triaged"
    And CASE_TRIAGED audit event is emitted
    And SLA timers are started per slas.yaml
