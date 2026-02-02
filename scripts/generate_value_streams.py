#!/usr/bin/env python3
"""
Generate `context.yaml` and `conceptual.mmd` for value streams from their `.md` files.
Usage: python scripts/generate_value_streams.py [--docs docs/value-architecture/value-streams]
"""
import argparse
import os
import re
import sys
import shutil
import datetime
import yaml

ROOT = os.path.dirname(os.path.dirname(__file__))

def read_front_matter(md_text):
    m = re.match(r"\A---\s*\n(.*?)\n---\s*\n", md_text, flags=re.S)
    if not m:
        return {}, md_text
    fm = m.group(1)
    try:
        data = yaml.safe_load(fm) or {}
    except Exception:
        data = {}
    rest = md_text[m.end():]
    return data, rest


def extract_mermaid(md_text):
    # Find a fenced mermaid or mmd block (case-insensitive)
    m = re.search(r"```(?:mermaid|mmd)\s*(.*?)```", md_text, flags=re.S | re.I)
    if m:
        return m.group(1).strip()
    return None


def extract_all_mermaid_blocks(md_text):
    """Return a list of all mermaid/mmd fenced code block contents (order preserved)."""
    blocks = re.findall(r"```(?:mermaid|mmd)\s*(.*?)```", md_text, flags=re.S | re.I)
    return [b.strip() for b in blocks]


def generate_skeleton(id_, title, fm):
    bcs = fm.get('bounded_contexts') or []
    lines = ["classDiagram\n"]
    vs_class = re.sub(r"[^0-9A-Za-z_]", "_", id_)
    lines.append(f"  class {vs_class} {{")
    lines.append("    +id: string")
    lines.append("    +purpose: string")
    lines.append("  }")
    if not bcs:
        # try to infer from a 'sections' key
        bcs = []
    for bc in bcs:
        bc_id = bc.get('id') or re.sub(r"[^0-9A-Za-z_]", "", bc.get('name','BC'))
        bc_class = re.sub(r"[^0-9A-Za-z_]", "", bc.get('name','Context'))
        lines.append(f"  class {bc_class} {{")
        lines.append("    +responsibilities: string")
        lines.append("  }")
        lines.append(f"  {vs_class} <|-- {bc_class} : contains")
    # add simple dependency if defined
    deps = fm.get('dependencies') or []
    for d in deps:
        # simple: d is string of other BC
        src = re.sub(r"[^0-9A-Za-z_]", "", d)
        for bc in bcs:
            name = re.sub(r"[^0-9A-Za-z_]", "", bc.get('name',''))
            if name:
                lines.append(f"  {name} --> {src} : depends_on")
    return "\n".join(lines)


def write_file_with_backup(path, content):
    if os.path.exists(path):
        ts = datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')
        bak = path + f'.bak-{ts}'
        shutil.copy2(path, bak)
        print(f"Backed up {path} -> {bak}")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


def main(docs_dir):
    docs_dir = os.path.abspath(docs_dir)
    if not os.path.isdir(docs_dir):
        print(f"Docs directory not found: {docs_dir}")
        return 2
    md_files = [p for p in os.listdir(docs_dir) if p.lower().endswith('.md') and p != 'README.md']
    if not md_files:
        print("No value stream .md files found")
        return 0
    created = []
    for md in md_files:
        path = os.path.join(docs_dir, md)
        with open(path, 'r', encoding='utf-8') as f:
            text = f.read()
        fm, rest = read_front_matter(text)
        # derive id and title
        id_ = fm.get('id') or os.path.splitext(md)[0]
        title = fm.get('title') or fm.get('name') or id_
        # Map file name to model folder: remove leading 'VS-' if present
        basename = os.path.splitext(md)[0]
        if basename.lower().startswith('vs-'):
            model_slug = basename[3:]
        else:
            model_slug = basename
        model_dir = os.path.join(ROOT, 'models', model_slug)
        os.makedirs(model_dir, exist_ok=True)
        # Build context.yaml
        context = {}
        context['id'] = id_
        context['name'] = title
        context['short_description'] = fm.get('short_description') or fm.get('description') or ''
        context['owner'] = fm.get('owners') or fm.get('owner') or []
        context['stakeholders'] = fm.get('stakeholders') or []
        context['inputs'] = fm.get('inputs') or []
        context['outputs'] = fm.get('outputs') or []
        context['triggers'] = fm.get('triggers') or []
        context['bounded_contexts'] = fm.get('bounded_contexts') or []
        context['dependencies'] = fm.get('dependencies') or []
        context['last_updated'] = datetime.date.today().isoformat()
        context['source_file'] = os.path.relpath(path, ROOT).replace('\\','/')
        ctx_path = os.path.join(model_dir, 'context.yaml')
        write_file_with_backup(ctx_path, yaml.safe_dump(context, sort_keys=False))
        # Build conceptual.mmd and add source header
        blocks = extract_all_mermaid_blocks(text)
        ts = datetime.datetime.utcnow().isoformat() + 'Z'
        source_rel = os.path.relpath(path, ROOT).replace('\\\\','/')

        # Merge multiple classDiagram blocks if present
        class_lines = []
        seen = set()
        non_class_blocks = []
        for blk in blocks:
            if re.search(r'(?i)classDiagram', blk):
                # Remove leading classDiagram header from block
                body = re.sub(r'(?im)^\s*classDiagram\s*\n?', '', blk).strip()
                for ln in body.splitlines():
                    ln_strip = ln.rstrip()
                    if not ln_strip:
                        continue
                    if ln_strip not in seen:
                        class_lines.append(ln_strip)
                        seen.add(ln_strip)
            else:
                non_class_blocks.append(blk)

        if class_lines:
            # Build merged classDiagram
            mmd_body = 'classDiagram\n' + "\n".join(class_lines)
            if non_class_blocks:
                # Preserve non-class mermaid blocks as comments for reference
                commented = '\n\n%% Other mermaid blocks preserved:\n'
                for nb in non_class_blocks:
                    commented += '\n'.join('%% ' + l for l in nb.splitlines()) + '\n'
                mmd_body = mmd_body + commented
        else:
            # No classDiagram blocks found — fall back to skeleton
            mmd_body = generate_skeleton(id_, title, fm)
            if blocks:
                commented = '\n'.join('%% ' + line for line in '\n\n'.join(blocks).splitlines())
                mmd_body = mmd_body + '\n\n%% Original mermaid blocks (no classDiagram found):\n' + commented

        header = f"%% Auto-generated conceptual diagram — source: {source_rel}, generated: {ts}\n"
        # If there is already an auto-generated header, replace it; otherwise prepend
        if mmd_body.lstrip().startswith('%% Auto-generated'):
            mmd_content = re.sub(r"\A%%.*?\n", header, mmd_body, flags=re.S)
        else:
            mmd_content = header + mmd_body
        mmd_path = os.path.join(model_dir, 'conceptual.mmd')
        write_file_with_backup(mmd_path, mmd_content)
        created.append((ctx_path, mmd_path))
        print(f"Generated for {md} -> {model_dir}")
    print('\nSummary:')
    for ctx, mmd in created:
        print(f" - {ctx}")
        print(f" - {mmd}")
    return 0

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--docs', default=os.path.join('docs','value-architecture','value-streams'))
    args = p.parse_args()
    sys.exit(main(args.docs))
