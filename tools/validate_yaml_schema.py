#!/usr/bin/env python3
from __future__ import annotations

import glob
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

import yaml
from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]


def load_yaml(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def expand_globs(patterns: List[str]) -> List[Path]:
    files: List[Path] = []
    for pat in patterns:
        files.extend(Path(p).resolve() for p in glob.glob(str(ROOT / pat), recursive=True))
    # Deduplicate while preserving order
    seen = set()
    uniq: List[Path] = []
    for f in files:
        if f not in seen and f.is_file():
            seen.add(f)
            uniq.append(f)
    return uniq


def format_error(err) -> str:
    loc = "$"
    if err.absolute_path:
        loc += "." + ".".join(str(x) for x in err.absolute_path)
    return f"{loc}: {err.message}"


def validate_file(schema: Dict[str, Any], data: Any, file_path: Path) -> List[str]:
    v = Draft202012Validator(schema)
    errors = sorted(v.iter_errors(data), key=lambda e: list(e.absolute_path))
    return [f"{file_path.relative_to(ROOT)}: {format_error(e)}" for e in errors]


def main() -> int:
    schema_map_path = ROOT / "content/core/specs/schemas/schema-map.yaml"
    if not schema_map_path.exists():
        print("ERROR: content/core/specs/schemas/schema-map.yaml not found", file=sys.stderr)
        return 2

    schema_map = load_yaml(schema_map_path)
    mappings = schema_map.get("mappings", [])
    if not mappings:
        print("ERROR: schema-map.yaml has no mappings", file=sys.stderr)
        return 2

    all_errors: List[str] = []
    validated_count = 0

    for m in mappings:
        schema_rel = m.get("schema")
        patterns = m.get("files", [])
        if not schema_rel or not patterns:
            all_errors.append("schema-map.yaml: each mapping must include schema and files")
            continue

        schema_path = ROOT / schema_rel
        if not schema_path.exists():
            all_errors.append(f"Missing schema: {schema_rel}")
            continue

        schema = load_json(schema_path)
        files = expand_globs(patterns)

        if not files:
            # It's valid to have empty matches early in a repo’s life, but we fail loudly so it's noticed.
            all_errors.append(f"No files matched patterns for schema {schema_rel}: {patterns}")
            continue

        for f in files:
            try:
                data = load_yaml(f)
            except Exception as ex:
                all_errors.append(f"{f.relative_to(ROOT)}: YAML parse error: {ex}")
                continue

            errs = validate_file(schema, data, f)
            if errs:
                all_errors.extend(errs)
            validated_count += 1

    if all_errors:
        print("\n".join(all_errors), file=sys.stderr)
        print(f"\nFAILED: validated {validated_count} file(s) with errors.", file=sys.stderr)
        return 1

    print(f"OK: validated {validated_count} file(s) successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
