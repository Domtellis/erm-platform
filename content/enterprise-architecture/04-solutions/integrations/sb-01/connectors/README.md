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
  - AI_SUGGESTION_CREATED (Notify Risk Lead of new AI insights)

## AI Service Connector: erm-ai-risk-service
- Type: Event-driven (Kafka) + Synchronous Feedback API.
- Consumption: Listens for `BREACH_CASE_CREATED`.
- Production: Emits `AI_SUGGESTION_CREATED` (via Gemini 2.0).
- Feedback: Receives `AI_CALIBRATION_FEEDBACK_CAPTURED` endpoint.

## Production hardening checklist
- Authentication/authorisation for inbound endpoint
- Replay protection / idempotency on `event_id`
- Structured logging and correlation IDs
- Dead-letter handling for failed notifications
