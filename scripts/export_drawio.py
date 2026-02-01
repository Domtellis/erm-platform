"""Export Mermaid `.mmd` conceptual diagrams to `.svg`, `.html` previews and editable `.drawio` files.

Requirements:
- Node.js/npm available for `npx @mermaid-js/mermaid-cli` to render SVGs.

Behavior:
- Scans `models/*/conceptual.mmd` files
- Renders each to `exports/drawio/<NN>-<slug>.svg` using `mmdc` (via npx)
- Writes an HTML wrapper `exports/drawio/<NN>-<slug>.html` with inline SVG for immediate viewing
- Creates a `.drawio` file `exports/drawio/<NN>-<slug>.drawio` embedding the SVG and a hidden cell containing the original `.mmd` text (so draw.io users can retrieve/replace the mermaid source)

Notes:
- If `mmdc` is not available, the script will attempt to call it via `npx`.
- Run locally: `python scripts/export_drawio.py`
"""

import subprocess
import sys
import tempfile
from pathlib import Path
import xml.etree.ElementTree as ET
import html
import os

ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = ROOT / 'models'
EXPORT_DIR = ROOT / 'exports' / 'drawio'
EXPORT_DIR.mkdir(parents=True, exist_ok=True)


def render_mermaid_to_svg(mmd_text: str, svg_path: Path) -> bool:
    """Render Mermaid text to SVG using mmdc (Mermaid CLI).

    Returns True on success.
    """
    # Write temp .mmd file
    with tempfile.NamedTemporaryFile('w', suffix='.mmd', delete=False, encoding='utf-8') as tf:
        tf.write(mmd_text)
        tmp_mmd = tf.name

    # Try to run mmdc directly, otherwise use npx
    cmds = [
        ['mmdc', '-i', tmp_mmd, '-o', str(svg_path)],
        ['npx', '-y', '@mermaid-js/mermaid-cli', 'mmdc', '-i', tmp_mmd, '-o', str(svg_path)],
    ]

    for cmd in cmds:
        try:
            print('Running:', ' '.join(cmd))
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            os.remove(tmp_mmd)
            return True
        except FileNotFoundError:
            # command not found, try next
            continue
        except subprocess.CalledProcessError as e:
            print('mmdc error:', e.stderr.decode('utf-8', errors='ignore'))
            continue

    print('ERROR: Could not run mmdc (Mermaid CLI). Please install Node.js and run `npm i -g @mermaid-js/mermaid-cli` or ensure `npx` is available.')
    try:
        os.remove(tmp_mmd)
    except Exception:
        pass
    return False


def make_drawio_xml(svg_text: str, mermaid_source: str, title: str) -> str:
    """Create a minimal Draw.io (.drawio) XML file containing the SVG embedded and the mermaid source in a hidden cell.

    The generated `.drawio` file will render the SVG as an image (so it displays in draw.io) and also include a text cell with the Mermaid source (so editors can copy it out).
    """
    # Build simple mxGraphModel with one page
    mxfile = ET.Element('mxfile', attrib={'host': 'app.diagrams.net'})
    diagram = ET.SubElement(mxfile, 'diagram', attrib={'id': 'diagram-1', 'name': title})

    # Build inner XML content for the diagram
    # We'll create a root mxGraphModel with basic cells and an image cell that contains the SVG as value.
    # Use CDATA for large content.
    content = f'''<mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="<![CDATA[{svg_text}]]>" style="image;html=1;pointerEvents=1;" vertex="1" parent="1">
      <mxGeometry x="20" y="20" width="1000" height="600" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="<![CDATA[{html.escape(mermaid_source)}]]>" style="text;html=1;strokeColor=none;fillColor=none;overflow=hidden;" vertex="1" parent="1">
      <mxGeometry x="-1000" y="-1000" width="10" height="10" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>'''

    diagram.text = content

    # Serialize to string
    xml_str = ET.tostring(mxfile, encoding='utf-8')
    return xml_str.decode('utf-8')


def generate_export_for_mmd_file(mmd_path: Path):
    mmd_text = mmd_path.read_text(encoding='utf-8')
    # Remove leading comments like %% ... from our conceptual.mmd
    lines = [l for l in mmd_text.splitlines() if not l.strip().startswith('%%')]
    mermaid_text = '\n'.join(lines).strip()
    # Prepare filenames
    parent = mmd_path.parent
    slug = parent.name
    export_prefix = EXPORT_DIR / slug
    svg_path = export_prefix.with_suffix('.svg')
    drawio_path = export_prefix.with_suffix('.drawio')
    html_path = export_prefix.with_suffix('.html')

    export_prefix.parent.mkdir(parents=True, exist_ok=True)

    # Render SVG
    ok = render_mermaid_to_svg(mermaid_text, svg_path)
    if not ok:
        print(f'Failed to render SVG for {mmd_path} — skipping draw.io export')
        return False

    # Read SVG text
    svg_text = svg_path.read_text(encoding='utf-8')

    # Create HTML wrapper for preview
    html_content = f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>{slug} — Mermaid Preview</title>
</head>
<body>
  {svg_text}
</body>
</html>
"""
    html_path.write_text(html_content, encoding='utf-8')

    # Create draw.io XML file
    drawio_xml = make_drawio_xml(svg_text, mermaid_text, title=slug)
    drawio_path.write_text(drawio_xml, encoding='utf-8')

    print(f'Exported: {drawio_path}, {svg_path}, {html_path}')
    return True


def main():
    mmd_files = sorted(MODELS_DIR.glob('**/conceptual.mmd'))
    if not mmd_files:
        print('No conceptual.mmd files found under models/.')
        return

    success = True
    for m in mmd_files:
        try:
            ok = generate_export_for_mmd_file(m)
            success = success and ok
        except Exception as e:
            print('Error processing', m, e)
            success = False

    if not success:
        sys.exit(2)


if __name__ == '__main__':
    main()
