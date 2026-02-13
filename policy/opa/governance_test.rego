package erm.governance

import future.keywords.if

test_allow_high_severity_with_risk_owner if {
    allow with input as {
        "severity": "high",
        "approver_role": "bu_risk_owner",
        "submitted_by": "user1",
        "approver_user_id": "user2"
    }
}

test_deny_high_severity_with_wrong_role if {
    not allow with input as {
        "severity": "high",
        "approver_role": "risk_lead", # Wrong role for High
        "submitted_by": "user1",
        "approver_user_id": "user2"
    }
}

test_deny_sod_violation if {
    not allow with input as {
        "severity": "medium",
        "approver_role": "risk_lead",
        "submitted_by": "user1",
        "approver_user_id": "user1" # SoD violation
    }
}
