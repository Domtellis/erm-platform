# Value Stream Generator

This project contains a small generator that produces `context.yaml` and `conceptual.mmd` artifacts in `models/` from the value stream `.md` source files under `docs/value-architecture/value-streams/`.

How it works
- `scripts/generate_value_streams.py` parses `VS-*.md` files and extracts the table rows into structured fields.
- A `context.yaml` is created/updated in the corresponding `models/<NN>-<slug>/` folder.
- A `conceptual.mmd` Mermaid flowchart is generated for a quick conceptual view.
- Existing files are backed up to a `.backups` folder before being replaced.

Automation
- A GitHub Actions workflow `.github/workflows/generate-value-streams.yml` runs on push or pull request changes to the `docs/value-architecture/value-streams/` files and commits any regenerated artifacts back to the repo.

Usage (local)
- Install dependencies: `pip install -r scripts/requirements.txt`
- Run: `python scripts/generate_value_streams.py`
- To target a different models folder: `python scripts/generate_value_streams.py --models models`

Notes
- The generator extracts the following fields: id, name, short_description, stakeholders, triggers, inputs, entry_criteria, key_activities, decisions_and_gates, outputs, exit_criteria, metrics, source_file, last_updated.
- If an exact `models/` folder with the right numeric prefix exists it will write into that folder; otherwise it will create a new one.
- Keep value stream `.md` files consistent (use the table pattern) for best results.
