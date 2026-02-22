#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import List, Tuple

ROOT = Path(__file__).resolve().parents[1]
MD_LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")


def is_external(link: str) -> bool:
    return link.startswith(("http://", "https://", "mailto:", "#"))


def normalise_link(link: str) -> str:
    # Strip fragments and query strings for filesystem checks
    link = link.split("#", 1)[0]
    link = link.split("?", 1)[0]
    return link.strip()


def check_file(md_path: Path) -> List[str]:
    errors: List[str] = []
    text = md_path.read_text(encoding="utf-8", errors="replace")

    for raw in MD_LINK_RE.findall(text):
        link = raw.strip()
        if is_external(link):
            continue
        link = normalise_link(link)
        if not link:
            continue

        # Relative to the markdown file location
        target = (md_path.parent / link).resolve()
        try:
            # Ensure it stays within repo (avoid weird ../../.. escapes)
            target.relative_to(ROOT)
        except Exception:
            errors.append(f"{md_path.relative_to(ROOT)}: link escapes repo root: {raw}")
            continue

        if not target.exists():
            errors.append(f"{md_path.relative_to(ROOT)}: missing target for link: {raw}")

    return errors


def main() -> int:
    md_files = list(ROOT.rglob("*.md"))
    all_errors: List[str] = []

    for f in md_files:
        # Skip dependency, internal agent, and template directories
        if any(p in f.parts for p in ("node_modules", ".venv", "dist", "build", ".agent", ".gemini", "_templates", "archive")):
            continue
        all_errors.extend(check_file(f))

    if all_errors:
        print("\n".join(all_errors), file=sys.stderr)
        print(f"\nFAILED: {len(all_errors)} broken internal link(s).", file=sys.stderr)
        return 1

    print("OK: internal markdown links validated.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
