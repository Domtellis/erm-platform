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


def generate_mermaid(context):
    lines = []
    lines.append('%% Auto-generated conceptual diagram — edit source .md to regenerate')
    lines.append('flowchart LR')

    # Inputs
    if context['inputs']:
        lines.append('  subgraph Inputs')
        for i, inp in enumerate(context['inputs'], start=1):
            lines.append(f'    I{i}["{inp}"]')
        lines.append('  end')

    # Activities
    if context['key_activities']:
        lines.append('  subgraph Activities')
        for i, act in enumerate(context['key_activities'], start=1):
            # keep nodes short
            label = act if len(act) < 80 else act[:77] + '...'
            lines.append(f'    A{i}["{label}"]')
        lines.append('  end')

    # Outputs
    if context['outputs']:
        lines.append('  subgraph Outputs')
        for i, out in enumerate(context['outputs'], start=1):
            lines.append(f'    O{i}["{out}"]')
        lines.append('  end')

    # Connections - simple linear flow: first input -> first activity -> ... -> first output
    conn = []
    if context['inputs'] and context['key_activities']:
        conn.append(f'I1-->A1')
    for i in range(1, len(context['key_activities'])):
        conn.append(f'A{i}-->A{i+1}')
    if context['key_activities'] and context['outputs']:
        conn.append(f'A{len(context['key_activities'])}-->O1')

    # If no inputs but activities exist, chain activities
    if not context['inputs'] and context['key_activities']:
        for i in range(1, len(context['key_activities'])):
            conn.append(f'A{i}-->A{i+1}')
        if context['outputs']:
            conn.append(f'A{len(context['key_activities'])}-->O1')

    lines.extend(['  ' + c for c in conn])

    # Add metadata footnote
    lines.append(f'  classDef meta fill:#f9f9f9,stroke:#eee;')
    lines.append(f'  %% source: {context.get("source_file")}, generated: {context.get("last_updated")}')

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

    # write conceptual.mmd
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
