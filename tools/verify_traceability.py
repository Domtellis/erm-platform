import yaml
import glob
from pathlib import Path
import sys

def load_yaml(path):
    if not path.exists():
        return None
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    except Exception as e:
        print(f"Error loading {path}: {e}")
        return None

def main():
    root = Path("content/traceability")
    if not root.exists():
        print("Traceability folder not found.")
        return 1

    # 1. Load Catalogues (Nodes)
    # We allow some to be missing but warn.
    catalogues = {
        "okr": {"file": "../enterprise-architecture/01-strategy/okrs.yaml", "ids": set(), "key": "okrs", "id_field": "okr_id"},
        "vs": {"file": "../enterprise-architecture/02-business/value-streams/value-streams.yaml", "ids": set(), "key": "value_streams", "id_field": "vs_id"},
        "cap": {"file": "../enterprise-architecture/02-business/capabilities/capabilities-ref.yaml", "ids": set(), "key": "capabilities", "id_field": "capability_id"},
        "journey": {"file": "../enterprise-architecture/03-experience/journeys/journeys.yaml", "ids": set(), "key": "journeys", "id_field": "journey_id"},
        "blueprint": {"file": "../enterprise-architecture/03-experience/service-blueprints/service-blueprints.yaml", "ids": set(), "key": "blueprints", "id_field": "blueprint_id"},
        "workflow": {"file": "../enterprise-architecture/03-experience/workflows/workflows.yaml", "ids": set(), "key": "workflows", "id_field": "workflow_id"},
        "prd": {"file": "../enterprise-architecture/05-product/01-prds/prds.yaml", "ids": set(), "key": "prds", "id_field": "prd_id"}
    }

    print("--- Loading Catalogues ---")
    for type_name, config in catalogues.items():
        fpath = root / config["file"]
        data = load_yaml(fpath)
        if data:
            # Handle list based catalogues
            if "key" in config:
                items = data.get(config["key"], [])
                for item in items:
                    config["ids"].add(item.get(config["id_field"]))
            print(f"Loaded {len(config['ids'])} {type_name}(s) from {config['file']}")
        else:
            print(f"WARNING: Catalogue {config['file']} missing. Validation for {type_name} will be limited.")

    # 2. Load Mappings (Edges) and Validate
    mappings = [
        {"file": "01-okr-to-value-stream.yaml", "src": "okr", "tgt": "vs", "src_field": "okr_id", "tgt_field": "vs_id"},
        {"file": "02-value-stream-to-capability.yaml", "src": "vs", "tgt": "cap", "src_field": "vs_id", "tgt_field": "capability_id"},
        {"file": "03-capability-to-journey.yaml", "src": "cap", "tgt": "journey", "src_field": "capability_id", "tgt_field": "journey_id"},
        {"file": "04-journey-to-service-blueprint.yaml", "src": "journey", "tgt": "blueprint", "src_field": "journey_id", "tgt_field": "blueprint_id"},
        {"file": "05-service-blueprint-to-workflow.yaml", "src": "blueprint", "tgt": "workflow", "src_field": "blueprint_id", "tgt_field": "workflow_id"},
        {"file": "06-workflow-to-prd.yaml", "src": "workflow", "tgt": "prd", "src_field": "workflow_id", "tgt_field": "prd_id"}
        # 07-prd-to-epic is special because epics/features are defined in-line or in backlog, simple check for PRD existence
    ]

    print("\n--- Validating Mappings ---")
    errors = 0
    
    for m in mappings:
        fpath = root / m["file"]
        data = load_yaml(fpath)
        if not data:
            continue
            
        links = data.get("links", [])
        print(f"Checking {len(links)} links in {m['file']}...")
        
        for link in links:
            lid = link.get("link_id", "???")
            s_id = link.get(m["src_field"])
            t_id = link.get(m["tgt_field"])
            
            # Check Source
            src_cat = catalogues[m["src"]]
            if src_cat["ids"] and s_id not in src_cat["ids"]:
                print(f"  [Error] Link {lid}: Source {m['src']} ID '{s_id}' not found in {src_cat['file']}")
                errors += 1
            
            # Check Target
            tgt_cat = catalogues[m["tgt"]]
            if tgt_cat["ids"] and t_id not in tgt_cat["ids"]:
                print(f"  [Error] Link {lid}: Target {m['tgt']} ID '{t_id}' not found in {tgt_cat['file']}")
                errors += 1

    if errors == 0:
        print("\nSUCCESS: All links verified against available catalogues.")
    else:
        print(f"\nFAILURE: Found {errors} integrity errors.")

if __name__ == "__main__":
    main()
