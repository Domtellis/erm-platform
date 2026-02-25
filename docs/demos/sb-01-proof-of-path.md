# SB-01 Proof-of-Path Demonstration

This guide outlines how to execute and verify the end-to-end "Walking Skeleton" for the SB-01 Appetite Breach Response flow.

## 1. Prepare Environment

Navigate to the local infrastructure directory and start the platform:

```bash
cd infra/local
docker compose up -d
```

Ensure the mock servers are running:

```bash
cd tools/stubs
npm install
npm start
```

## 2. Start the Consumers (Observation)

In two separate terminals, start the audit and event consumers to watch the flow:

Terminal A (Event Harness):
```bash
cd tools/event-harness
npm install
npm run consume
```

Terminal B (Audit Sink):
```bash
cd services/audit-and-reporting
node audit-sink.js
```

## 3. Run the Walkthrough Script

In a new terminal, execute the driver script:

```bash
cd tools/event-harness
node sb-01-walkthrough.js
```

## 4. Verification

After execution, verify the following:

- **Logs**: The `event-harness` terminal should show validated CloudEvents for `breach-detected` and `decision-approved`.
- **Audit**: The `audit-sink` terminal should show the events being persisted with consistent trace metadata.
- **Observability**: Navigate to [AI TRiSM Dashboard](https://erm.prod:5180/grafana/d/ai-risk-performance/) to see the end-to-end telemetry.
- **Contract Integrity**: The script will fail if the payloads do not match the JSON Schemas in `core/specs`.
- **Governance**: The mock `decision-approved` response includes the `sod_check_passed` flag, simulating the OPA policy engine evaluation.
