# Documentation Templates

This directory contains canonical templates for technical documentation.

## Available Templates

### 1. ADR Template (`adr-template.md`)
Architecture Decision Record following MADR format.

**Usage:**
```bash
cp docs/_templates/adr-template.md docs/adrs/00XX-decision-name.md
# Edit with your decision details
```

### 2. Runbook Template (`runbook-template.md`)
Operational runbook for service troubleshooting.

### 3. User Guide Template (`user-guide-template.md`)
End-user documentation template.

## Naming Conventions

### ADRs
- Format: `XXXX-kebab-case-title.md`
- Example: `0008-ai-model-selection.md`
- Sequential numbering (don't skip numbers)

### Runbooks
- Format: `service-name-operations.md`
- Example: `ai-service-operations.md`

### User Guides
- Format: `feature-name-user-guide.md`
- Example: `ai-risk-assessment-user-guide.md`

## Standards

- **ADRs:** Follow MADR format (Markdown Any Decision Record)
- **Runbooks:** Include health checks, common issues, escalation procedures
- **User Guides:** Audience-appropriate language, screenshots/diagrams encouraged

## Best Practices

1. **Link to related docs:** Cross-reference ADRs, PRDs, and implementation docs
2. **Keep updated:** Review quarterly, mark deprecated decisions
3. **Version control:** Use git history, don't delete old decisions
4. **Audience clarity:** Know who will read this (developers, ops, end-users)
