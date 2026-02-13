Feature: Appetite and Threshold Evaluation
  As a Risk Lead
  I want to evaluate breaches against appetite thresholds
  So that severity is consistently determined with rationale

  Background:
    Given a breach case in state "Triaged"
    And I am logged in as Risk Lead

  @E-02 @F-02-01 @S-05
  Scenario: Select appetite statement version and threshold
    When I select appetite statement version "AS-2026-01" and threshold "TH-SAFETY-HIGH"
    Then the Evaluation context stores appetite_statement_version_id and threshold_id
    And APPETITE_SELECTED audit event is emitted

  @E-02 @F-02-02 @S-06
  Scenario: Evaluate measured value against threshold with mandatory rationale
    Given an appetite statement and threshold are selected
    When I evaluate measured value "85" with rationale "Exceeds limit by 15%"
    Then the result is computed as "breach"
    And computed_severity is "High"
    And THRESHOLD_EVALUATED audit event is emitted

  @E-02 @F-02-02
  Scenario: Evaluation fails without rationale
    Given an appetite statement and threshold are selected
    When I attempt to evaluate measured value "85" without rationale
    Then the evaluation is rejected
    And an error message indicates rationale is mandatory
