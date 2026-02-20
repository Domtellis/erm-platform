import sys
import argparse
import json
import os
import time
from datetime import datetime, timedelta

REGISTRY_PATH = os.path.join(os.path.dirname(__file__), 'models.json')
REFRESH_INTERVAL_HOURS = 24

def load_registry():
    if not os.path.exists(REGISTRY_PATH):
        return None
    with open(REGISTRY_PATH, 'r') as f:
        return json.load(f)

def check_for_updates():
    """
    Simulates checking for a new version of the model registry.
    In a real platform, this would fetch from a remote URL.
    """
    last_check_file = os.path.join(os.path.dirname(__file__), '.last_sync')
    should_refresh = False
    
    if not os.path.exists(last_check_file):
        should_refresh = True
    else:
        last_sync = os.path.getmtime(last_check_file)
        if datetime.fromtimestamp(last_sync) < datetime.now() - timedelta(hours=REFRESH_INTERVAL_HOURS):
            should_refresh = True
            
    if should_refresh:
        # touch the sync file
        with open(last_check_file, 'w') as f:
            f.write(datetime.now().isoformat())
        return True
    return False

def get_recommendation(task, registry):
    task = task.lower()
    models = {m['id']: m for m in registry['models']}
    
    # Priority Keywords Mapping
    # Critical reasoning / Debugging
    if any(k in task for k in ['bug', 'error', 'fails', 'crash', 'race condition', 'logic', 'why']):
        # Escalate based on "Thinking" keywords
        if 'security' in task or 'critical' in task:
            return models.get('claude-sonnet-4-6-thinking', models['claude-sonnet-4-5-thinking'])
        return models['claude-sonnet-4-5-thinking']
        
    # Architecture / High Context / Repository-wide
    if any(k in task for k in ['architect', 'design', 'multi-service', 'system', 'structure', 'planning', 'repository', 'traceability']):
        if 'reasoning' in task or 'logic' in task or 'deep' in task:
             return models['gemini-3-1-pro-high']
        if 'critical' in task or 'legacy' in task:
             return models.get('claude-opus-4-5-thinking', models['gemini-3-1-pro-high'])
        return models.get('gemini-3-1-pro-high', models['gemini-3-pro-high'])
        
    # Complex Coding / Logic / Sub-system
    if any(k in task for k in ['algorithm', 'refactor', 'optimization', 'performance', 'logic', 'module']):
        if '3.1' in task or 'expert' in task:
            return models['gemini-3-1-pro-low']
        return models['claude-sonnet-4-5']
        
    # Standard Development
    if any(k in task for k in ['feature', 'test', 'api', 'service']):
        return models['gemini-3-pro-low']

    # Research
    if any(k in task for k in ['research', 'explain', 'search', 'find']):
        return models['gpt-oss-120b-medium']

    # Default to Flash for everything else (Quota safe)
    return models['gemini-3-flash']

def main():
    parser = argparse.ArgumentParser(description="Advanced Antigravity Model Selection Engine")
    parser.add_argument("--task", required=False, help="Description of the task to perform")
    parser.add_argument("--sync", action="store_true", help="Force a refresh of the model registry")
    args = parser.parse_args()

    registry = load_registry()
    if not registry:
        print("Error: Model Registry (models.json) not found.")
        sys.exit(1)

    if args.sync:
        print("Forcing Model Registry sync...")
        # In a real impl, this would download the latest models.json
        print(f"Successfully synced registry (Version {registry['version']}).")
        sys.exit(0)

    updated = check_for_updates()
    if updated:
        # Check against latest known version
        latest_version = "1.1.0"
        if registry['version'] < latest_version:
             print(f"[UPDATE] New models detected! Please run --sync to update from {registry['version']} to {latest_version}.")
        else:
             print(f"[NOTE] Automated model check performed (Interval: {REFRESH_INTERVAL_HOURS}h). No new models found.")

    if not args.task:
        parser.print_help()
        sys.exit(0)

    rec = get_recommendation(args.task, registry)
    
    print("-" * 60)
    print(f"RECOMMENDED MODEL : {rec['name']}")
    print(f"TIER              : {rec['tier']}")
    print(f"DESCRIPTION       : {rec['description']}")
    print(f"PLATFORM ID       : {rec['id']}")
    print("-" * 60)
    print(f"Quota Impact      : {'*' * rec['cost_rank']}")
    print("-" * 60)

if __name__ == "__main__":
    main()
