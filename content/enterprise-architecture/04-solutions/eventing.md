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

## Naming Conventions
- **Type**: `erm.<domain>.<event-name>.<version>`
- **Source**: `/<domain>/<service-name>`

## Versioning Rules
- **Minor/Patch (Additive)**: New optional fields. Consumer must be resilient.
- **Major (Breaking)**: Field removals or type changes. Requires a new type (v2).
