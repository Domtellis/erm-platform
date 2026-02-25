# SB-01 Clickable Prototype

## Overview

Mid-fidelity clickable HTML prototype for the **Appetite Breach Response** workflow (SB-01).

**Purpose**: Validate usability and workflow comprehension before build.

## Quick Start

```powershell
cd docs/ux/prototypes/sb-01/app
python -m http.server 8080
# Open https://erm.prod:5180/admin/ in browser
```

Or simply open `app/index.html` directly in a browser.

## Scope

| Aspect | Value |
|:-------|:------|
| Lighthouse | SB-01 |
| Persona Coverage | Incident Lead, Risk Lead, BU Risk Owner |
| Screens | 13 |
| Fidelity | Mid-fidelity (realistic layout, labels, sample data) |
| Backend | None (click navigation only) |

## File Structure

```
sb-01/
├── README.md           # This file
├── screen-index.md     # Screen manifest with E/F/S mapping
├── flows/              # Wireflow Mermaid diagrams
├── data/               # Sample data
├── app/                # Clickable prototype
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── usability-test-plan.md
└── test-notes/
```

## Related Documents

- [PRD](../../../../content/enterprise-architecture/05-product/01-prds/sb-01/prd.md)
- [Service Blueprint](../../../../content/enterprise-architecture/03-experience/service-blueprints/sb-01-appetite-breach-response.md)
- [Stories](../../../../content/enterprise-architecture/05-product/02-backlog/sb-01/stories.yaml)
- [Information Architecture](../../ia.md)
