
## 1. Risk Appetite evaluation feature 

    This is a BDD (Behaviour-Driven Development) test specification written in Gherkin (commonly used with Cucumber/SpecFlow/Behave). It describes the expected behaviour of your SB-01 product slice around Risk Appetite + Threshold evaluation (Epic E-02, Features F-02-01/F-02-02, Stories S-05/S-06).

    I’ll break it down line by line and map it to your product artefacts (workflow, entities, audit events, and governance).

### 1) What this file is testing (the business capability)

    Feature: Appetite and Threshold Evaluation
    This “Feature” (in Gherkin terms) is not exactly the same as your backlog “Feature IDs”, but you’ve aligned them using tags.
    It’s testing that a Risk Lead can:
    - Select the right appetite statement version and threshold (F-02-01 / S-05), and
    - Evaluate a measured value against that threshold with a mandatory rationale (F-02-02 / S-06),
    and that the system emits audit events (APPETITE_SELECTED, THRESHOLD_EVALUATED) as per your event catalogue.

### 2) The “user story” header (why it matters)
    As a Risk Lead
       I want to evaluate breaches against appetite thresholds
       So that severity is consistently determined with rationale
    
    This is the business intent. In product terms, it’s asserting:
    - Severity must be deterministic (not opinionated or ad hoc).
    - The decision must be defensible because rationale is captured.
    - The workflow is governed through auditable events.

### 3) Background: the shared preconditions
    Background:
        Given a breach case in state "Triaged"
        And I am logged in as Risk Lead
    What it implies
        There is already a BreachCase record.
        Its workflow status is Triaged (so you’re allowed to run evaluation now).
        The current authenticated user has role risk_lead (RBAC must allow evaluation actions).

    Why “Triaged” matters
    In your state model, evaluation logically happens after triage:
    - Detected → Triaged → ValidatedAgainstAppetite

    So this background enforces workflow correctness: you can’t evaluate a random case in “Detected” without triage fields being set.

#### A) Scenario 1 — selecting appetite + threshold (F-02-01 / S-05)
    @E-02 @F-02-01 @S-05
    Scenario: Select appetite statement version and threshold
        When I select appetite statement version "AS-2026-01" and threshold "TH-SAFETY-HIGH"
        Then the Evaluation context stores appetite_statement_version_id and threshold_id
        And APPETITE_SELECTED audit event is emitted

    What “When” means (system action)

    The Risk Lead performs a UI/API action like:
        - Choose AppetiteStatementVersion = AS-2026-01
        - Choose Threshold = TH-SAFETY-HIGH

    What “Evaluation context stores …” means (data expectation)
    Your product should create or update an Evaluation record (or evaluation context) and set:
        - Evaluation.appetite_statement_version_id = AS-2026-01
        - Evaluation.threshold_id = TH-SAFETY-HIGH

    This aligns with your information-model/sb-01/entities.yaml entity Evaluation.

    Why the audit event matters
       “APPETITE_SELECTED audit event is emitted” means the platform must write an append-only AuditEvent like:
        - event_type = APPETITE_SELECTED
        - payload includes breach_case_id, appetite_statement_version_id

    This matches your information-model/sb-01/events.yaml and governance/audit/audit-events-catalog.yaml.

    Governance implication: later, an auditor can prove which appetite version was used (important when statements are versioned).

#### B) Scenario 2 — evaluating measured value with rationale (F-02-02 / S-06)
    @E-02 @F-02-02 @S-06
    Scenario: Evaluate measured value against threshold with mandatory rationale
        Given an appetite statement and threshold are selected
        When I evaluate measured value "85" with rationale "Exceeds limit by 15%"
        Then the result is computed as "breach"
        And computed_severity is "High"
        And THRESHOLD_EVALUATED audit event is emitted

    
**The “Given” (precondition)**
        This relies on Scenario 1 having occurred (or the system being set up similarly):
        - Evaluation already has appetite_statement_version_id and threshold_id.

**The “When” (core evaluation behaviour)**
        The Risk Lead supplies:
        - measured_value = 85
        - rationale = "Exceeds limit by 15%"

    The system then:
       1.Fetches the chosen Threshold (e.g., limit_value, operator, severity mapping).
       2.Compares measured_value vs limit_value.
       3.Sets:
          Evaluation.result → "breach" (because it exceeds the limit)
          Evaluation.computed_severity → "High" (based on mapping)

**Important subtlety: why severity becomes “High”**
        That depends entirely on how TH-SAFETY-HIGH is defined, typically something like:
        operator: >=
        limit_value: 70
        severity_mapping: breach ⇒ High

    So the scenario is asserting that:
        - The threshold configuration corresponds to “High” severity when breached.

**Audit event emission**
        The system must emit THRESHOLD_EVALUATED with payload including:
        - evaluation_id, threshold_id, measured_value, result, computed_severity

**Platform implication**: this is a control-relevant event and should be immutable and retained.

#### C) Scenario 3 — negative test: rationale is mandatory (F-02-02)
    @E-02 @F-02-02
    Scenario: Evaluation fails without rationale
        Given an appetite statement and threshold are selected
        When I attempt to evaluate measured value "85" without rationale
        Then the evaluation is rejected
        And an error message indicates rationale is mandatory

**Why this scenario is critical**
        It tests a policy gate: rationale is a required governance attribute.
        It ensures:
        - You can’t generate “severity” without justification.
        - You prevent “rubber stamping” and preserve defensibility.

**What “rejected” means in implementation terms**
        Depending on implementation, rejection could be:
        - API returns 400 Bad Request with validation message, or
        - UI blocks submission and shows inline error.

**The expected message: “rationale is mandatory”.**
        Should an audit event be emitted here?
        Your scenario does not require one. That’s fine.

**Industry pattern:**
        - Only log successful “control events” in the main audit stream.
        - Optionally log failed attempts to a security/telemetry stream (not always governance audit).

        If you want to strengthen this later, you could add an optional event like EVALUATION_REJECTED to a telemetry stream, but it’s not required for MVP.

### 4) What the tags mean (@E-02 @F-02-02 @S-06)

**These tags are very good practice in your repo because they link tests to delivery traceability:**
        - @E-02 → Epic: Appetite and threshold evaluation
        - @F-02-01 / @F-02-02 → Features in your backlog
        - @S-05 / @S-06 → User stories in stories.yaml

**Why it matters (industry best practice):**
        - You can run test subsets by tag (e.g., only run @F-02-02 tests).
        - You can produce automated coverage reports: “Feature F-02-02 has passing scenarios”.
        - You get bidirectional traceability: PRD/feature → tests.

### 5) How this maps to your “as-code” artefacts

    - Workflow constraint (must be Triaged first):
        product/lighthouses/sb-01/workflow-state-model.mmd

    - Data stored (Evaluation):
        information-model/sb-01/entities.yaml

    - Audit events required:
        information-model/sb-01/events.yaml
        governance/audit/audit-events-catalog.yaml

    - Acceptance criteria alignment:
        delivery/backlog/sb-01/acceptance-criteria.md
        delivery/backlog/sb-01/stories.yaml

### 6) What’s missing / what you might tighten (optional, but “industry-grade”)

    If you want to harden this test spec further (common in regulated workflows), add scenarios for:
    -  Version validity: appetite version must be effective on the breach date (effective_from/to)
    - RBAC: Incident Lead cannot run evaluation (403)
    - Idempotency: re-running evaluation overwrites or versions results predictably
    - Audit payload correctness: event includes correct IDs and computed fields
    
    But as written, this is a solid MVP-level BDD suite for F-02-01/F-02-02.

    