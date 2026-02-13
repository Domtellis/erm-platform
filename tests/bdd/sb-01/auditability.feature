Feature: Auditability and Export
  As a Risk Lead
  I want immutable audit logs and exportable audit packs
  So that governance and compliance requirements are met

  @E-05 @F-05-01 @S-14
  Scenario: All control actions emit audit events
    Given a breach case is processed end-to-end
    Then all control events listed in audit-events-catalogue.yaml are emitted
    And audit events are append-only and immutable

  @E-05 @F-05-02 @S-15
  Scenario: Export audit pack
    Given a breach case in state "Closed"
    And I am logged in as Risk Lead
    When I export the audit pack
    Then the export includes:
      | Section                        |
      | Case summary and state timeline |
      | Appetite statement version     |
      | Evaluation results             |
      | Decision and approvals         |
      | Evidence index                 |
      | Action plan history            |
      | Audit event timeline           |
    And AUDIT_PACK_EXPORTED audit event is emitted
