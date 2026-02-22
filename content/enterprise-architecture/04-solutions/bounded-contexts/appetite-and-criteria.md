# Bounded Context: Appetite & Criteria

## Purpose
Own appetite statements, versions, thresholds, and severity mapping logic.

## Owned Entities (System of Record)
- **AppetiteStatementVersion**: Governed versions of appetite statements.
- **Threshold**: Rules for determining breach status.

## Key Invariants
- Only one "Active" version per appetite category at a time.
- Threshold changes require a new AppetiteStatementVersion.
- **AI Anomaly Triggers**: Feed into criteria reviews based on state-change patterns.

## Outbound Events
- `APPETITE_VERSION_PUBLISHED`
- `THRESHOLD_UPDATED`

## Synchronous APIs
- `GET /appetites/current` (Used by Monitoring for evaluation)

## Coupling & Dependencies
- Minimal coupling; acts as a reference data provider for most other domains.
