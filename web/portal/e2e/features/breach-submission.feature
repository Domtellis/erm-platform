Feature: ISO-Standardized Risk Breach Submission
  As a Workplace Safety Officer ("risk_lead")
  I want to submit a new Occupational Health & Safety breach (ISO 45001)
  So that the system can perform a NIST-aligned risk assessment.

  Scenario: Successfully submit an ISO 45001 Financial Loss breach
    Given I am logged in as "site-user-01"
    When I navigate to the "New Breach Submission" page
    And I enter a unique Reference ID for the "Financial Loss" report
    And I fill in the metrics for a "LTIFR (Lost Time Injury Rate)" of "60000" (ISO 31000 Scale)
    And I submit the ISO-standardized report
    Then the breach should appear in the "Risk Registry" with status "AI Assessment Ready"
