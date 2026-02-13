# Traceabilty - Industry best practice for product / platform delivery 

- Because it includes the full “why → what → how → build” chain starting from strategy (OKRs). 
- It’s more complete, more governable, and scales better as stakeholders expand (execs, risk, audit, engineering).


## Best-practice traceability chain (recommended)

- okr to value stream to capability to journey to service-blueprint to workflow to prd to epic-feature 

## Use this as your canonical set:

### traceability/
  - README.md
  - okr-to-value-stream.yaml
  - value-stream-to-capability.yaml
  - capability-to-journey.yaml
  - journey-to-service-blueprint.yaml
  - service-blueprint-to-workflow.yaml
  - workflow-to-prd.yaml
  - prd-to-epic-feature.yaml


## Why this is best practice
- OKR → Value Stream ties delivery to measurable outcomes.
- Value Stream → Capability ties operating model to stable business capabilities.
- Capability → Journey/service-blueprint ties capabilities to user experience and service delivery.
- Service Blueprint → Workflow ties service design to executable state machines.
- Workflow → PRD → Backlog ties specs to product intent and delivery increments.

----------------------------------------------

# Traceability (Everything-as-Code)

Traceability chain (required sequence):
OKR -> Value Stream -> Capability -> Journey -> Blueprint -> Workflow -> PRD -> Epic/Feature

## Best-practice conventions
- Stable IDs (never rename; deprecate instead)
- Many-to-many supported at every hop
- Each link includes:
  - contribution: primary|supporting
  - confidence: 0.0-1.0
  - rationale: why this linkage exists
  - effective_from / effective_to (optional)
  - approval (optional: who approved the traceability change)

## Suggested CI checks
- YAML lint + schema validation
- Referential integrity checks (no dangling IDs)
- PR gate: any change to OKR/VS/CAP/JRN/BP/WF/PRD must update mappings

## Files
Under respective folders in enterprise architecture:
- okrs.yaml
- north-star.yaml
- value-streams.yaml
- capabilities-ref.yaml
- journeys.yaml
- blueprints.yaml
- workflows.yaml
- prds.yaml

Mappings (sequence):
- okr-to-value-stream.yaml
- value-stream-to-capability.yaml
- capability-to-journey.yaml
- journey-to-blueprint.yaml
- blueprint-to-workflow.yaml
- workflow-to-prd.yaml
- prd-to-epic-feature.yaml
