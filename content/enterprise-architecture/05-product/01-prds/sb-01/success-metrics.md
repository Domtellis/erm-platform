id: sb-01
version: 0.1.0
bu: BU-01
category: safety

leading_indicators:
  - id: m1
    name: time_to_triage_minutes_p50
    definition: "Minutes from breach case created to state=Triaged (p50)."
    target: 60
  - id: m2
    name: time_to_decision_minutes_p50
    definition: "Minutes from case created to DecisionApproved (p50)."
    target: 480
  - id: m3
    name: evidence_completeness_rate
    definition: "Percentage of closed cases meeting evidence policy for their severity."
    target: 0.9
  - id: m4
    name: in_tool_completion_rate
    definition: "Percentage of cases that reach Closed without using off-platform approvals."
    target: 0.85

lagging_indicators:
  - id: m5
    name: repeat_breach_rate_30d
    definition: "Same breach type recurring within 30 days (proxy: similar category + location + hazard)."
    target: 0.1
  - id: m6
    name: audit_findings_count
    definition: "Number of audit findings attributed to missing approvals/evidence for safety breaches."
    target: 0

adoption_signals:
  - id: a1
    name: weekly_active_users
    definition: "Unique users performing SB-01 actions per week."
    target: 10
  - id: a2
    name: cases_processed_per_week
    definition: "Count of breach cases moved beyond Triaged weekly."
    target: 5
