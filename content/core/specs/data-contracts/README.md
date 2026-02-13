# Data Contracts

This directory contains the formal, versioned schemas for all domain events and API payloads used in the ERM platform.

## Structure
- Each schema is stored as a `.json` (JSON Schema) or `.yaml` file.
- Naming convention: `<domain>.<service>.<event-name>.<version>.<ext>`

## Versioning
- **Major changes** (breaking) result in a new filename (e.g., `v2`).
- **Minor changes** (non-breaking, additive) are updated in-place (following semantic versioning in the schema description).

## Usage
- These schemas should be used in CI/CD pipelines to validate message payloads.
- They serve as the source of truth for code generators and documentation tools.
- Contract changes MUST be approved by the domain owners (see `CODEOWNERS`).
