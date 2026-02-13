#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import re
import os
import textwrap
from typing import List, Tuple

ROOT = Path(__file__).resolve().parents[1]

EA_DIR = ROOT / "content" / "enterprise-architecture" / "03-experience"
JOURNEYS_DIR = EA_DIR / "journeys"
BLUEPRINTS_DIR = EA_DIR / "service-blueprints"

PERSONAS_DIR = ROOT / "content" / "core" / "catalogues" / "personas"
WORKFLOWS_DIR = EA_DIR / "workflows"

H1_RE = re.compile(r"^#\s+(.+)$", re.MULTILINE)


def title_from_md(path: Path) -> str:
    txt = path.read_text(encoding="utf-8", errors="replace")
    m = H1_RE.search(txt)
    return m.group(1).strip() if m else path.stem


def rel(from_dir: Path, to_path: Path) -> str:
    try:
        return str(to_path.relative_to(from_dir)).replace("\\", "/")
    except ValueError:
        # fall back to a relative path with '..' when target is outside from_dir
        return os.path.relpath(to_path, start=from_dir).replace("\\", "/")


def list_md(dir_path: Path) -> List[Path]:
    if not dir_path.exists():
        return []
    return sorted([p for p in dir_path.glob("*.md") if p.is_file()])


def list_yaml(dir_path: Path) -> List[Path]:
    if not dir_path.exists():
        return []
    return sorted([p for p in dir_path.glob("*.y*ml") if p.is_file()])


def md_list(items: List[Tuple[str, str]]) -> str:
    if not items:
        return "_(none yet)_"
    lines = []
    for title, link in items:
        lines.append(f"- [{title}]({link})")
    return "\n".join(lines)


def main() -> int:
    EA_DIR.mkdir(parents=True, exist_ok=True)

    journeys = [(title_from_md(p), rel(EA_DIR, p)) for p in list_md(JOURNEYS_DIR)]
    blueprints = [(title_from_md(p), rel(EA_DIR, p)) for p in list_md(BLUEPRINTS_DIR)]
    persona_yamls = [(p.name, rel(EA_DIR, p)) for p in list_yaml(PERSONAS_DIR)]
    workflow_yamls = [(p.name, rel(EA_DIR, p)) for p in list_yaml(WORKFLOWS_DIR)]

    content = "\n".join([
        "---",
        "doc_type: index",
        "index_id: experience-architecture",
        "generated_by: scripts/generate_experience_architecture_readme.py",
        "---",
        "",
        "# Experience Architecture",
        "",
        "This index is **generated**. Do not edit manually — run:",
        "",
        "```bash",
        "make generate-index",
        "```",
        "",
        "## Journey maps",
        md_list(journeys),
        "",
        "## Service blueprints",
        md_list(blueprints),
        "",
        "## Persona catalogue (YAML)",
        md_list(persona_yamls),
        "",
        "## Workflow specs (YAML)",
        md_list(workflow_yamls),
        "",
    ]) + "\n"

    readme_path = EA_DIR / "README.md"
    readme_path.write_text(content, encoding="utf-8")
    return 0
    
if __name__ == "__main__":
    raise SystemExit(main())


