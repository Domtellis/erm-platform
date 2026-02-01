# Draw.io exports

This folder contains generated draw.io files and web previews for each value stream conceptual diagram.

Files generated per value stream:
- `<NN>-<slug>.drawio` — editable Draw.io XML file that contains the rendered SVG and the original Mermaid source in a hidden text cell. Open in draw.io / diagrams.net to edit.
- `<NN>-<slug>.svg` — rendered SVG of the Mermaid diagram for quick viewing.
- `<NN>-<slug>.html` — simple HTML file embedding the SVG for immediate viewing in a browser without opening draw.io.

How it's generated
- The GitHub Actions workflow `generate-value-streams.yml` now runs the exporter after regenerating `models/*/conceptual.mmd`.
- The exporter uses `@mermaid-js/mermaid-cli` (`mmdc`) to render SVGs.

Local usage
- Ensure Node.js and npm are installed and available on your PATH.
- Install mermaid-cli: `npm i -g @mermaid-js/mermaid-cli` (or rely on `npx` which the script will attempt to use).
- Run: `python scripts/export_drawio.py`

Notes
- If the exporter cannot run `mmdc`, it will print an error and skip draw.io export for that file.
