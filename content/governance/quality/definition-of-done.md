# Definition of Done (DoD) - ERM 2026

**Applies to**: All Feature and Bugfix Pull Requests.

## 1. Code Standards
- [ ] Code follows project style guide (Prettier/ESLint).
- [ ] Technical documentation (README/Wiki) updated.
- [ ] Unit test coverage > 85% for all new logic.

## 2. Governance & Compliance
- [ ] **Audit Events**: All new control actions emit a CloudEvent from the `audit-events-catalogue.yaml`.
- [ ] **Privacy**: PII Scrubbing layer verified for all new external API integrations.
- [ ] **Traceability**: All state transitions pass through the `decision-gates.yaml`.

## 3. AI Intelligence (if applicable)
- [ ] **Model Version**: Records `model_version` and `prompt_version` in the database.
- [ ] **Feedback Loop**: Includes Approve/Modify/Reject UI and logs disagreement rationale.
- [ ] **NFRs**: Latency < 2s (raw inference) and < 15s (E2E).

## 4. Operational Readiness
- [ ] Grafana dashboard updated or verified.
- [ ] Operations runbook updated with new failure modes.
- [ ] "Authority Matrix" reviewed for new decision types.
