# Scripts — quick reference

Short summary
- This folder contains small utility scripts used to validate, generate, and maintain repository artifacts (docs, models, YAMLs). Each entry below explains purpose, behavior, usage, and common failure modes.

Requirements
- Python 3.8+
- Optional dependencies (install with `py -3 -m pip install pyyaml jsonschema`):
  - pyyaml (used by generate_value_streams.py and validate_yaml_schema.py)
  - jsonschema (used by validate_yaml_schema.py)

Scripts

## 1) scripts/check_internal_links.py
- Purpose: validate internal Markdown links across the repository.
- Objective: catch broken links and links that escape the repository root.
- Behavior:
  - Scans all `.md` files (skips node_modules, .venv, dist, build).
  - Extracts inline links using a regex, ignores external links (http(s), mailto, internal fragments starting with `#`).
  - Normalizes links by removing fragments/queries and resolves targets relative to the source file.
  - Ensures target paths are inside the repository root and that the target exists.
- Usage:
  - `py -3 .\scripts\check_internal_links.py`
- Exit codes:
  - `0` — all links valid
  - `1` — one or more broken/internal-link errors printed to stderr
- Common issues:
  - Links with fragments are only checked for the file's existence (fragment anchors are not validated).
  - Links that intentionally rely on non-file targets (e.g., external hosting or generated pages) may need special consideration.

## 2) scripts/generate_experience_architecture_readme.py
- Purpose: generate `docs/experience-architecture/README.md` as an index for journey maps, service blueprints, persona YAMLs and workflow specs.
- Objective: automate and keep the index up-to-date with correct relative links and valid YAML frontmatter.
- Behavior:
  - Scans `docs/experience-architecture/journeys` and `service-blueprints` for `.md` and extracts H1 as titles (falls back to filename).
  - Finds persona YAMLs (catalogues/personas) and workflow YAMLs (specs/workflows) and produces relative links. Falls back to `os.path.relpath()` when files are outside the target directory.
  - Writes left-aligned YAML frontmatter (no indentation) and lists sections for the generated README.
- Usage:
  - `py -3 .\scripts\generate_experience_architecture_readme.py`
- Exit codes:
  - `0` — success
  - non-zero — script errors printed to stderr
- Common issues:
  - Must be run from repo root so path calculations and globs behave as expected.
  - On Windows, use `py -3` if `python3` alias is not present.
  - Ensure generated frontmatter starts at column 0 (static site parsers require this).

## 3) scripts/generate_value_streams.py
- Purpose: generate model artifacts from value stream markdown files under `docs/value-architecture/value-streams`.
- Objective: create per-model `context.yaml` and `conceptual.mmd` (Mermaid classDiagram) in `models/*` to represent outputs and relationships from each value stream document.
- Behavior:
  - Parses each VS markdown file, extracts a `| Section | Content |` style table, and reads fields such as `Outputs`, `Inputs`, `Triggers`, `Customers / stakeholders`, and `Purpose (value)`.
  - Maps output phrases to domain entity names using `MAPPING_OVERRIDES` or a PascalCase fallback.
  - Builds simple chained relationships between listed outputs and emits a Mermaid `classDiagram` in `conceptual.mmd`.
  - Writes `context.yaml` (id, name, short_description, owner, stakeholders, inputs, outputs, triggers, last_updated, source_file) and `conceptual.mmd` into the mapped folder under `models/`.
  - Skips any VS files whose ID is not present in `VS_TO_MODEL`.
- Usage:
  - `py -3 .\scripts\generate_value_streams.py`
- Common issues:
  - Requires the markdown to include a table in the expected format; if fields are missing they become empty lists/strings.
  - If a VS ID is unmapped (not present in `VS_TO_MODEL`) the file is skipped; update `VS_TO_MODEL` to include new mappings.

## 4) scripts/validate_yaml_schema.py
- Purpose: validate YAML files against JSON Schemas defined by `specs/schemas/schema-map.yaml`.
- Objective: ensure YAML artifacts conform to expected shapes and fail early on schema drift.
- Behavior:
  - Loads `specs/schemas/schema-map.yaml` which contains `mappings: - schema: <path> files: [<glob>...]`.
  - Expands globs relative to repo root, deduplicates matches, and validates each file with `jsonschema.Draft202012Validator`.
  - Reports validation errors with file-relative paths and JSONPath-like locations (`$.path.to.key: message`).
- Usage:
  - `py -3 .\scripts\validate_yaml_schema.py`
- Exit codes:
  - `0` — all matched files validated successfully
  - `1` — validation errors found (printed to stderr)
  - `2` — missing/malformed `specs/schemas/schema-map.yaml` or no mappings configured (printed to stderr)
- Common issues:
  - Ensure `specs/schemas/schema-map.yaml` exists and mappings point to correct schema paths and file globs.
  - globs that match no files are reported — useful to detect stale mappings.
  - Requires `pyyaml` and `jsonschema`.

Suggested CI integrations
- Add CI jobs to run `check_internal_links.py` and `validate_yaml_schema.py` on push/PR.
- Optionally run `generate_experience_architecture_readme.py` and `generate_value_streams.py` in CI `--check` mode (compare git diff) to detect drift.

