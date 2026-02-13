#!/usr/bin/env python3
"""Generate context.yaml and conceptual.mmd (Mermaid classDiagram)
from the value stream markdown files under docs/value-architecture/value-streams.

Usage: python scripts/generate_value_streams.py
This script writes into the content/core/models/* folders.
"""
import os
import re
import yaml
from datetime import date

ROOT = os.path.dirname(os.path.dirname(__file__))
DOCS_DIR = os.path.join(ROOT, "content", "enterprise-architecture", "02-business", "value-streams")
MODELS_DIR = os.path.join(ROOT, "content", "core", "models")

VS_TO_MODEL = {
    "VS-00": "00-risk-appetite",
    "VS-01": "01-risk-sensing",
    "VS-02": "02-risk-identification",
    "VS-03": "03-risk-analysis",
    "VS-04": "04-risk-evaluation",
    "VS-05": "05-risk-treatment",
    "VS-06": "06-risk-control-operation",
    "VS-07": "07-risk-monitoring",
    "VS-08": "08-risk-reporting",
    "VS-09": "09-learning-loop",
}

MAPPING_OVERRIDES = {
    # common phrase -> preferred domain entity
    "appetite statement": "RiskAppetiteStatement",
    "criteria/scoring model": "RiskCriteriaModelVersion",
    "scoring model": "RiskCriteriaModelVersion",
    "gate checklists": "GateChecklist",
    "gate checklist": "GateChecklist",
    "waiver workflows": "WaiverWorkflow",
    "waiver workflow": "WaiverWorkflow",
    "escalation matrix": "EscalationMatrix",
    "sensing dashboard": "SensingDashboard",
    "emerging risk list": "EmergingRisk",
    "normalised risk records": "RiskRecord",
    "ownership": "OwnershipAssignment",
    "dependency links": "DependencyLink",
    "triage status": "TriageStatus",
    "assessment backlog entries": "AssessmentBacklogEntry",
    "inherent/residual ratings": "RiskRating",
    "scenario analysis artefacts": "ScenarioAnalysis",
    "quantified exposure bands": "ExposureBand",
    "assumptions and evidence logs": "EvidenceLog",
}


def pascal_case(s: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9 ]+", " ", s)
    parts = [p.strip() for p in s.split() if p.strip()]
    return "".join(p.title() for p in parts)


def map_entity(phrase: str) -> str:
    key = phrase.strip().lower()
    if key in MAPPING_OVERRIDES:
        return MAPPING_OVERRIDES[key]
    # fallback generic mapping
    name = pascal_case(phrase)
    return name


def extract_table(md: str) -> dict:
    # Extract a simple | Section | Content | table rows
    rows = {}
    for m in re.finditer(r"^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$", md, flags=re.M):
        k = m.group(1).strip()
        v = m.group(2).strip()
        rows[k] = v
    return rows


def split_outputs(cell: str):
    # split by commas; also accept semicolons
    parts = re.split(r"[,;]", cell)
    return [p.strip() for p in parts if p.strip()]


def build_mermaid(entities, relationships):
    lines = ["```mermaid", "classDiagram"]
    for e in entities:
        lines.append(f"  class {e}")
    for (a, card_a, b, card_b, verb) in relationships:
        lines.append(f"  {a} \"{card_a}\" --> \"{card_b}\" {b} : {verb}")
    lines.append("```")
    return "\n".join(lines)


def generate_for(md_path):
    with open(md_path, "r", encoding="utf-8") as f:
        md = f.read()

    title_m = re.search(r"^##\s*(VS-\d+)\s*[—-]\s*(.+)$", md, flags=re.M)
    if not title_m:
        # fallback to filename
        base = os.path.basename(md_path)
        vs = os.path.splitext(base)[0]
        vs_id = vs.upper()
        name = vs
    else:
        vs_id = title_m.group(1).strip()
        name = title_m.group(2).strip()

    table = extract_table(md)
    outputs_cell = table.get("Outputs", "")
    outputs = split_outputs(outputs_cell)
    entities = [map_entity(o) for o in outputs]

    # Build simple chained relationships in listed order
    relationships = []
    for i in range(len(entities) - 1):
        a = entities[i]
        b = entities[i + 1]
        relationships.append((a, "1", b, "0..*", "informs"))

    mermaid = build_mermaid(entities, relationships)

    model_folder = VS_TO_MODEL.get(vs_id)
    if not model_folder:
        print(f"No model mapping for {vs_id}, skipping")
        return

    out_dir = os.path.join(MODELS_DIR, model_folder)
    os.makedirs(out_dir, exist_ok=True)

    # context.yaml
    ctx = {
        "id": vs_id,
        "name": name,
        "short_description": table.get("Purpose (value)", ""),
        "owner": "",
        "stakeholders": [s.strip() for s in table.get("Customers / stakeholders", "").split(",") if s.strip()],
        "inputs": [s.strip() for s in table.get("Inputs", "").split(",") if s.strip()],
        "outputs": entities,
        "triggers": [s.strip() for s in table.get("Triggers", "").split(",") if s.strip()],
        "last_updated": date.today().isoformat(),
        "source_file": os.path.relpath(md_path, ROOT).replace('\\\\', '/')
    }

    with open(os.path.join(out_dir, "context.yaml"), "w", encoding="utf-8") as f:
        yaml.safe_dump(ctx, f, sort_keys=False)

    # conceptual.mmd (Mermaid classDiagram)
    conceptual_path = os.path.join(out_dir, "conceptual.mmd")
    with open(conceptual_path, "w", encoding="utf-8") as f:
        f.write(f"%% Autogenerated conceptual model for {vs_id} - {name}\n")
        f.write(mermaid)

    print(f"Generated for {vs_id} -> {out_dir}")


def main():
    for fname in os.listdir(DOCS_DIR):
        if not fname.lower().endswith(".md"):
            continue
        if fname.startswith("README"):
            continue
        path = os.path.join(DOCS_DIR, fname)
        generate_for(path)


if __name__ == "__main__":
    main()
