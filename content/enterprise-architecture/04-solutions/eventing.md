# Eventing Standards

The ERM platform standardises on **CloudEvents 1.0** for all asynchronous communication.

## Event Envelope

All events must follow this structure:

```json
{
  "specversion": "1.0",
  "type": "erm.monitoring.breach-detected.v1",
  "source": "/monitoring/signal-ingestor",
  "id": "A234-1234-1234",
  "time": "2026-02-08T12:00:00Z",
  "datacontenttype": "application/json",
  "subject": "BC-2026-000123",
  "data": {
    "breach_case_id": "BC-2026-000123",
    "bu_id": "BU-01",
    "category": "safety",
    "severity": "high"
  }
}
```

## Key Events

- **Type**: `erm.monitoring.breach-detected.v1`
  - **Subject**: `BC-2026-XXXXXXX`
  - **Payload**: Breach metadata for enrichment.
- **Type**: `erm.ai.suggestion-created.v1`
  - **Subject**: `AS-2026-XXXXXXX`
  - **Source**: `/ai/erm-ai-risk-service`
  - **Payload**: Model version, suggestion score, rationale, and context.
- **Type**: `erm.ai.narrative-generated.v1`
  - **Subject**: `AN-2026-XXXXXXX`
  - **Payload**: AI-synthesised insights for disclosure packs.
- **Type**: `erm.calibration.feedback-captured.v1`
  - **Subject**: `FB-2026-XXXXXXX`
  - **Payload**: Human override rationale and calibration delta for model tuning.

## Event Envelope
...
