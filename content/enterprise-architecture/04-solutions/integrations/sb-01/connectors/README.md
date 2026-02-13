# SB-01 Connectors (Contract-first)

## Inbound: breach-detected (stub)
- Endpoint (example): `POST /integrations/sb-01/breach-detected`
- Validate payload against: `contracts/breach-detected.schema.json`
- Behaviour:
  1. Create `BreachSignal`
  2. Create a new `BreachCase` (or link if correlation rules match)
  3. Emit audit events:
     - BREACH_CASE_CREATED
     - BREACH_SIGNAL_LINKED

## Outbound: Microsoft Teams notifications
- Use a Teams webhook / connector approved by IT policy.
- Triggers:
  - ESCALATION_TRIGGERED (High severity)
  - APPROVAL_REQUESTED (Decision awaiting BU Risk Owner)

## Production hardening checklist
- Authentication/authorisation for inbound endpoint
- Replay protection / idempotency on `event_id`
- Structured logging and correlation IDs
- Dead-letter handling for failed notifications
