---
id: VS-0X
title: "<Name>"
status: draft
owners: ["Risk Function"]
last_reviewed: 2026-01-30
---

# VS-0X — <Name>

## Customers / stakeholders
- …

## Purpose (value)
- …

## Triggers
- …

## Inputs
- …

## Entry criteria / DoR
- …

## Key activities
1. …
2. …

## Decisions & stage gates
- D1 …
- D2 …
- D3 …

## Outputs
- …

## Exit criteria / DoD
- …

## Metrics
**Flow:** …
**Performance:** …
**Risk:** …

---

## Mermaid (conceptual diagram) guidance 🔧

If you want a richer conceptual diagram, include a Mermaid `classDiagram` block in your `.md` file. The generator will use that block verbatim to create `models/<NN>-<slug>/conceptual.mmd`. If no Mermaid block is present, the generator will fall back to a simple Inputs → Activities → Outputs flowchart.

Example (paste into the `.md` file as a fenced `mmd` or `mermaid` block):

```mmd
classDiagram
  class RiskAppetiteStatement
  class ToleranceThreshold
  class RiskCriteriaModelVersion
  class EscalationRule
  class DecisionGate
  class WaiverException
  class Approval
  class BreachCase
  class Risk

  RiskAppetiteStatement "1" --> "0..*" ToleranceThreshold : defines
  ToleranceThreshold "1" --> "1" RiskAppetiteStatement : belongsTo
  DecisionGate "1" --> "1" RiskCriteriaModelVersion : uses
  RiskCriteriaModelVersion "0..*" --> "0..*" DecisionGate : referencedBy
  EscalationRule "1" --> "0..*" BreachCase : routes
  BreachCase "1" --> "1" EscalationRule : routedBy
  DecisionGate "1" --> "0..*" WaiverException : hasWaiver
  WaiverException "1" --> "1" DecisionGate : grantedAgainst
  WaiverException "0..1" --> "1" Risk : relatesTo
  WaiverException "1" --> "0..*" Approval : approvedVia
  Approval "1" --> "1" WaiverException : approves
```

Notes:
- Keep diagrams focused on domain entities and relationships for clarity.
- Use a fenced block with the language `mmd` or `mermaid` or include an inline `classDiagram` paragraph; the generator will detect it.
