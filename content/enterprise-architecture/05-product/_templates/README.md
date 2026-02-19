# Product Documentation Templates

This directory contains canonical templates for product documentation artifacts.

## Available Templates

### 1. PRD Template (`prd-template.md`)
Product Requirements Document template following Lean PRD format.

**Usage:**
```bash
cp _templates/prd-template.md 01-prds/[product-id]/prd.md
# Edit YAML frontmatter and sections
```

### 2. Epic Template (`epic-template.yaml`)
YAML template for epic-level work items.

### 3. Feature Template (`feature-template.yaml`)
YAML template for feature-level work items.

### 4. Story Template (`story-template.yaml`)
YAML template for user stories (Connextra format).

## Template Standards

All templates follow industry best practices:
- **PRDs:** Lean PRD format (Google, Atlassian, Stripe)
- **YAML:** Structured data for automation/tooling
- **User Stories:** Connextra format ("As a... I want... So that...")

## Frontmatter Fields

### Required Fields
- `id`: Unique identifier (e.g., sb-02, e-sb02-01)
- `name`/`title`: Human-readable name
- `status`: Current state (draft, proposed, active, complete)
- `owner`: Responsible team/person

### Optional Fields
- `parent`: Parent product/epic ID (indicates dependency)
- `version`: Semantic version
- `compliance_review_required`: Triggers governance review
- `bu`: Business unit scope

## Best Practices

1. **Copy, don't reference:** Copy templates to your product folder and customize
2. **Consistent IDs:** Use hierarchical IDs (SB-02 → E-SB02-01 → F-SB02-001)
3. **YAML validation:** Run `make validate` to check YAML syntax
4. **Traceability:** Link child items to parents via ID fields

## Examples

See `01-prds/sb-01/` for reference implementations.
