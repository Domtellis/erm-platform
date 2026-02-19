package erm.governance

import future.keywords.if

default allow = false

# Rule: High severity decisions require BU Risk Owner
allow if {
    input.severity in {"high", "critical"}
    input.approver_roles[_] == "bu_risk_owner"
    sod_check
    input.has_evidence == true
}

# Rule: Medium/Low severity can be approved by Risk Lead
# EXCEPTION: Risk Leads can self-approve non-high severity items (Business Agility)
allow if {
    not input.severity in {"high", "critical"}
    input.approver_roles[_] in {"risk_lead", "bu_risk_owner"}
}

# Rule: Separation of Duties (Submitter cannot be Approver)
sod_check if {
    input.submitted_by != input.approver_user_id
}
