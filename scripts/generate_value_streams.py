"""Generate context.yaml and conceptual.mmd for value streams from docs markdown.

Usage: python scripts/generate_value_streams.py [--source docs/value-architecture/value-streams] [--models models]

This script:
- Scans the source folder for VS-*.md files
- Parses the table of sections and content
- Produces a context.yaml with structured fields
- Produces a `conceptual.mmd` mermaid flowchart showing Inputs -> Activities -> Outputs
- Backs up existing files before overwriting
"""

import argparse
import os
import re
import shutil
import yaml
from datetime import datetime
from pathlib import Path

MD_SRC_DEFAULT = "docs/value-architecture/value-streams"
MODELS_DIR_DEFAULT = "models"
BACKUP_DIR_NAME = ".backups"

ROW_RE = re.compile(r"^\|\s*(?P<key>[^|]+?)\s*\|\s*(?P<val>.+?)\s*\|\s*$")
TITLE_RE = re.compile(r"^##\s*(?P<id>VS-\d{2})\s*—\s*(?P<title>.+)$")

def parse_table(md_text):
    table = {}
    lines = md_text.splitlines()
    in_table = False
    for line in lines:
        if line.strip().startswith("|") and "---" not in line:
            m = ROW_RE.match(line)
            if m:
                k = m.group('key').strip()
                v = m.group('val').strip()
                table[k] = v
                in_table = True
        else:
            if in_table and line.strip() == "":
                # end of table
                break
    return table


def split_items(s):
    if not s:
        return []
    # split on <br> or semicolon or comma
    parts = re.split(r"<br\s*/?>|;|,\\s*", s)
    parts = [p.strip() for p in parts if p.strip()]
    return parts


def normalize_key(k):
    return k.lower().replace('/', '_').replace(' ', '_')


def generate_context(md_path, table, title_id, title_text):
    context = {
        'id': title_id,
        'name': title_text,
        'short_description': table.get('Purpose (value)', '').strip(),
        'owner': None,
        'stakeholders': split_items(table.get('Customers / stakeholders', '')),
        'triggers': split_items(table.get('Triggers', '')),
        'inputs': split_items(table.get('Inputs', '')),
        'entry_criteria': table.get('Entry criteria / DoR', ''),
        'key_activities': split_items(table.get('Key activities', '')),
        'decisions_and_gates': split_items(table.get('Decisions & stage gates', '')),
        'outputs': split_items(table.get('Outputs', '')),
        'exit_criteria': table.get('Exit criteria / DoD', ''),
        'metrics': table.get('Metrics', ''),
        'source_file': str(md_path),
        'last_updated': datetime.utcnow().isoformat() + 'Z'
    }
    return context


def extract_mermaid_block(md_text: str):
    """Extract a mermaid block from markdown text.

    Looks for fenced blocks with ```mmd or ```mermaid first; otherwise looks for an inline
    `classDiagram` block (consecutive lines starting with `classDiagram` until a blank line
    or a markdown header).
    Returns the mermaid content string (without the enclosing fences), or None.
    """
    # fenced code blocks
    fenced = re.search(r"```(?:mmd|mermaid)\n(?P<body>.*?)(?:\n```)", md_text, re.S | re.I)
    if fenced:
        return fenced.group('body').strip()

    # inline classDiagram block
    lines = md_text.splitlines()
    start = None
    for idx, line in enumerate(lines):
        if line.strip().startswith('classDiagram'):
            start = idx
            break
    if start is not None:
        body_lines = []
        for line in lines[start:]:
            if line.strip() == '' or line.strip().startswith('## '):
                break
            body_lines.append(line.rstrip())
        return '\n'.join(body_lines).strip()

    return None


# Helpers to auto-generate a classDiagram when none is provided in the source .md
def _sanitize_to_classname(s: str) -> str:
    parts = re.findall(r"\w+", s)
    if not parts:
        return 'X'
    # Take up to first 4 words to avoid extremely long names
    parts = parts[:4]
    return ''.join(p.capitalize() for p in parts)


def generate_class_diagram_from_context(context: dict) -> str:
    """Create a mermaid classDiagram representing inputs, activities and outputs."""
    lines = []
    lines.append('classDiagram')

    inputs = context.get('inputs', [])
    activities = context.get('key_activities', [])
    outputs = context.get('outputs', [])
    decisions = context.get('decisions_and_gates', [])

    # Create classes
    in_names = []
    for i, inp in enumerate(inputs, start=1):
        name = _sanitize_to_classname(f'Input{i}_{inp}')
        in_names.append(name)
        lines.append(f'  class {name}')

    act_names = []
    for i, act in enumerate(activities, start=1):
        name = _sanitize_to_classname(f'Activity{i}_{act}')
        act_names.append(name)
        lines.append(f'  class {name}')

    out_names = []
    for i, out in enumerate(outputs, start=1):
        name = _sanitize_to_classname(f'Output{i}_{out}')
        out_names.append(name)
        lines.append(f'  class {name}')

    dec_names = []
    for i, dec in enumerate(decisions, start=1):
        name = _sanitize_to_classname(f'Decision{i}_{dec}')
        dec_names.append(name)
        lines.append(f'  class {name}')

    # Relationships
    if in_names and act_names:
        lines.append(f'  {in_names[0]} "1" --> "0..*" {act_names[0]} : feeds')
    for i in range(len(act_names) - 1):
        lines.append(f'  {act_names[i]} --> {act_names[i+1]}')
    if act_names and out_names:
        lines.append(f'  {act_names[-1]} --> {out_names[0]} : produces')

    # Decisions attached to first activity if present
    if dec_names and act_names:
        for dec in dec_names:
            lines.append(f'  {dec} "1" --> "0..*" {act_names[0]} : governs')

    # Include a source footnote
    lines.append(f'  %% source: {context.get("source_file")}, generated: {context.get("last_updated")}')
    return '\n'.join(lines)


def generate_mermaid(context):
    # If the source markdown included a mermaid block, use it verbatim
    if context.get('mermaid_raw'):
        lines = []
        lines.append('%% Auto-generated conceptual diagram — from mermaid block in source .md')
        lines.append(context.get('mermaid_raw').rstrip())
        lines.append(f'%% source: {context.get("source_file")}, generated: {context.get("last_updated")}')
        return '\n'.join(lines)

    # Fallback: generate a classDiagram from Inputs/Activities/Outputs
    lines = []
    lines.append('%% Auto-generated conceptual diagram — generated classDiagram from .md')
    lines.append(generate_class_diagram_from_context(context))

    return '\n'.join(lines)


def backup_file(path: Path, backup_root: Path):
    backup_root.mkdir(parents=True, exist_ok=True)
    if path.exists():
        ts = datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
        dest = backup_root / f"{path.name}.{ts}.bak"
        shutil.copy(path, dest)
        print(f'Backed up {path} -> {dest}')


def write_file(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')
    print(f'Wrote {path}')


def process_file(md_path: Path, models_dir: Path):
    text = md_path.read_text(encoding='utf-8')
    title_id = None
    title_text = md_path.stem
    for line in text.splitlines():
        m = TITLE_RE.match(line.strip())
        if m:
            title_id = m.group('id')
            title_text = m.group('title').strip()
            break
    if not title_id:
        # fall back to filename
        title_id = md_path.stem

    table = parse_table(text)
    context = generate_context(md_path, table, title_id, title_text)

    # map to models folder by numeric prefix
    prefix_match = re.match(r"VS-(?P<num>\d{2})", title_id)
    if prefix_match:
        num = prefix_match.group('num')
        # find a model dir with same numeric prefix
        model_dir = None
        for d in models_dir.iterdir():
            if d.is_dir() and d.name.startswith(num + '-'):
                model_dir = d
                break
        if not model_dir:
            # create a folder with the slug from md filename
            slug = md_path.stem.split('-', 1)[-1]
            model_dir = models_dir / f"{num}-{slug}"
            model_dir.mkdir(parents=True, exist_ok=True)
    else:
        # generic fallback
        model_dir = models_dir / md_path.stem
        model_dir.mkdir(parents=True, exist_ok=True)

    # backup existing files
    backup_root = model_dir / BACKUP_DIR_NAME
    backup_file(model_dir / 'context.yaml', backup_root)
    backup_file(model_dir / 'conceptual.mmd', backup_root)

    # write context.yaml
    yaml_path = model_dir / 'context.yaml'
    write_file(yaml_path, yaml.safe_dump(context, sort_keys=False, allow_unicode=True))

    # extract any mermaid block from the source markdown (prefer fenced ```mmd / ```mermaid, or inline classDiagram)
    mermaid_raw = extract_mermaid_block(text)
    if mermaid_raw:
        context['mermaid_raw'] = mermaid_raw
    else:
        # No mermaid provided — auto-generate a classDiagram and append it to the source .md
        generated = generate_class_diagram_from_context(context)
        # Backup the source .md before modifying
        md_backup_root = md_path.parent / BACKUP_DIR_NAME
        backup_file(md_path, md_backup_root)
        # Append a fenced mermaid block to the end of the markdown
        new_block = '\n\n```mmd\n' + generated + '\n```\n'
        text = text + new_block
        md_path.write_text(text, encoding='utf-8')
        print(f'Appended generated mermaid block to {md_path}')
        # set context mermaid_raw so conceptual.mmd uses the same content
        context['mermaid_raw'] = generated

    # write conceptual.mmd (use mermaid block if present, otherwise generate a fallback)
    mmd = generate_mermaid(context)
    mmd_path = model_dir / 'conceptual.mmd'
    write_file(mmd_path, mmd)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', default=MD_SRC_DEFAULT)
    parser.add_argument('--models', default=MODELS_DIR_DEFAULT)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    src = Path(args.source)
    models = Path(args.models)

    md_files = sorted(p for p in src.glob('VS-*.md') if '_templates' not in p.parts)
    if not md_files:
        print('No value stream markdown files found.')
        return

    for md in md_files:
        print(f'Processing {md}')
        process_file(md, models)

    print('Done.')

if __name__ == '__main__':
    main()
