# Service blueprint markdown with acceptance criteria + non-functional controls

## Each blueprint includes:
- frontstage + backstage
- systems, data objects, handoffs
- failure points + controls
- evidence generation, approval chains, audit logging
- acceptance criteria (Gherkin)
- NFR controls: auditability, SoD, retention, lineage (plus security/perf/availability)



## The 4 blueprints provided earlier were a starter “lighthouse set” (high adoption, high governance value, and they force the hard platform controls: evidence, approvals, audit logging). They are not a complete blueprint portfolio.

### How many service blueprints should you have (best practice)
In practice, teams maintain a blueprint backlog of ~10–20 scenarios, but only implement 1–3 first as the MVP wedge. 
A good rule:
- At least 1 blueprint per value stream (VS-00..VS-09) for baseline coverage
- Plus cross-cutting “moments that matter” (waivers, exceptions, audit packs, disclosures, SoD gates)

### Recommended “complete” blueprint set for your ERM platform

Below is a balanced portfolio that covers each value stream and the key cross-cutting governance flows.

#### Core (should exist to claim “end-to-end ERM”)
- SB-01 Appetite breach response (VS-07 + VS-00 + VS-09) ✅ already done
- SB-02 Stage-gate risk criteria embedded (VS-00 + VS-03 + VS-04 + VS-05) ✅
- SB-03 Control assurance → evidence → audit pack (VS-06 + VS-08) ✅
- SB-04 Incident → learning loop (VS-09 + VS-07 + VS-03) ✅

### Add these to complete baseline ERM flows:
- SB-05 Signal intake → triage → candidate risk created
    - VS: VS-01 → VS-02
    - Why: makes risk creation easy (big adoption driver) and reduces admin burden.

- SB-06 Risk identification & quality gate (new risk / duplicate / ownership / links)
    - VS: VS-02
    - Why: controls portfolio hygiene (ownership, duplicates, minimum fields).

- SB-07 Evidence-first assessment + second-line challenge
    - VS: VS-03
    - Why: standardises assessment quality; prevents “opinion-only” scoring.

- SB-08 Portfolio prioritisation & concentration review (decision ask creation)
    - VS: VS-04 → VS-08
    - Why: turns risk data into decisions and funding asks; critical for exec adoption.

- SB-09 Treatment plan → funding → delivery tracking → verification → acceptance
    - VS: VS-05 → VS-04
    - Why: closes the loop from “risk agreed” to “risk moved” with verification evidence.

- SB-10 Board pack compilation → data certification → sign-off → decision ledger
    - VS: VS-08
    - Why: “one version of truth” gate + traceability; reduces board-cycle pain.

### Governance “exceptions” (high value, often missed)
- SB-11 Waiver / exception management (timeboxed, justified, approved, monitored)
    - VS: VS-00 + VS-07 + VS-08
    - Why: prevents waivers becoming bypasses; enforces expiry + conditions.

- SB-12 External disclosure workflow (regulator/customer) + legal + data owner certification
    - VS: VS-08
    - Why: crucial for defensibility; aligns approvals and retention/lineage.

### Optional extensions (depending on your client’s needs)
- SB-13 Third-party risk onboarding & continuous monitoring
    - VS: VS-01 + VS-02 + VS-07

- SB-14 Assurance planning (audit universe → test plan → sampling → findings → closure)
    - VS: VS-06 + VS-08

Are we “missing” them right now?
- You’re not “wrong” with 4 — you have a strong starting set.
- But if your goal is a complete ERM blueprint library, then yes: you should add SB-05 to SB-10 at minimum, and then decide if SB-11/12 are in MVP scope or Phase 2.