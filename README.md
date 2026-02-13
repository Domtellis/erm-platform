# ERM Platform Repository

## Repository Structure

```text
erm-platform/
├── content/
│   ├── enterprise-architecture/
│   │   ├── 01-strategy/       # OKRs, Drivers
│   │   ├── 02-business/       # Capabilities, Value Streams
│   │   ├── 03-experience/     # Journeys, Workflows
│   │   ├── 04-solutions/      # Bounded Contexts, Diagrams
│   │   └── 05-product/        # [RENUMBERED]
│   │       ├── 01-prds/       # Definition (Specs)
│   │       ├── 02-backlog/    # Execution (Epics, Features, Stories)
│   │       └── 03-metrics/    # Assessment (KPIs)
│   ├── governance/            # Policies, Controls, Security, Quality
│   ├── core/                  # Meta-Models (Catalogues, Specs)
│   └── traceability/          # The Golden Thread
├── references/                # Imports (Source Material)
├── docs/                      # Generated Docs
│   ├── adrs/                  # Architecture Decisions
│   └── exports/               # Exports (PDFs)
├── tools/                     # Scripts & Makefile
└── .github/workflows/         # CI/CD
```
