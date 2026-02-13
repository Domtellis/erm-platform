---
doc_type: ux_decision
decision_id: ux-adr-0001
title: Navigation Taxonomy
status: accepted
date: 2026-02-07
---

# UX-ADR-0001: Navigation Taxonomy

## Status
Accepted

## Context
The ERM platform needs a consistent navigation structure that:
1. Supports task-based workflows (what users come to do)
2. Provides object hubs for data exploration
3. Scales beyond SB-01 to Risk, Controls, Monitoring, and Reporting
4. Avoids "menu soup" as features grow

## Decision

We will use a **hybrid navigation model**:

1. **Primary Navigation (Left Sidebar)**: Task-based top-level categories
   - Home, Breaches, Risk, Controls, Monitoring, Decisions, Actions, Reports, Admin

2. **Secondary Navigation (Context Header)**: Object-specific actions
   - Breadcrumbs, status chips, action buttons

3. **Object Hubs**: Each core object type has a consistent detail page pattern
   - Header with status/severity/SLA
   - Tab-based sections (Details, Timeline, Evidence, Actions)
   - Action panel (primary CTA)

## Consequences

### Positive
- Users learn one navigation pattern that scales
- Object consistency reduces training time
- Tab-based sections support progressive disclosure

### Negative
- Initial learning curve for enterprise users expecting folder-based navigation
- Requires consistent header component across all object types

### Mitigations
- Usability testing will validate label comprehension
- Documentation will include "Where do I go?" guides per persona
