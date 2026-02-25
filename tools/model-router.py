import sys
import argparse
import json
import os
import subprocess
from datetime import datetime, timedelta, timezone

REGISTRY_PATH = os.path.join(os.path.dirname(__file__), 'models.json')
REFRESH_INTERVAL_HOURS = 1 # Dynamic Quota Snapshot refresh

def load_registry():
    if not os.path.exists(REGISTRY_PATH):
        return None
    with open(REGISTRY_PATH, 'r') as f:
        return json.load(f)

def trigger_shadow_sync():
    """Launches sync-daemon.py in the background without blocking."""
    daemon_path = os.path.join(os.path.dirname(__file__), 'sync-daemon.py')
    try:
        if os.name == 'nt': # Windows
            subprocess.Popen([sys.executable, daemon_path], 
                             creationflags=subprocess.CREATE_NO_WINDOW | subprocess.DETACHED_PROCESS)
        else:
            subprocess.Popen([sys.executable, daemon_path], 
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    except:
        pass

def check_for_updates(registry):
    """
    Checks if the registry is stale (> 24h) and triggers shadow sync.
    """
    last_updated_str = registry.get('last_updated')
    if not last_updated_str:
        trigger_shadow_sync()
        return True
        
    try:
        # Handle ISO strings like 2026-02-24T22:13:33.112402Z
        cleaned_time = last_updated_str.replace('Z', '')
        last_updated = datetime.fromisoformat(cleaned_time)
        if last_updated < datetime.now(timezone.utc) - timedelta(hours=REFRESH_INTERVAL_HOURS):
            trigger_shadow_sync()
            return True
    except:
        trigger_shadow_sync()
        return True
    return False

def get_recommendation(task, registry, critical=False):
    task = task.lower()
    models_list = registry['models']
    models_dict = {m['id']: m for m in models_list}
    
    # helper for fallback
    def find_fallback(current_id):
        # Fallback priority: Elite -> Critical -> Advanced -> Enhanced -> Standard
        tiers = ["Elite", "Critical", "Advanced", "Enhanced", "Standard"]
        try:
            current_tier = models_dict[current_id]['tier']
            idx = tiers.index(current_tier)
            for next_tier in tiers[idx+1:]:
                for m in models_list:
                    if m['tier'] == next_tier and m.get('quota', 1.0) > 0.15:
                        return m
        except:
            pass
        return models_dict.get('gemini-3-flash')

    # --- LIFECYCLE-AWARE WEIGHTED SCORING ---
    score = 0
    factors = []

    # 1. Maintenance & Housekeeping (Strong Penalty)
    maint_keys = ['cleanup', 'delete', 'remove', 'format', 'organize', 'formalize', 'temporary', 'unused', 'ledger', 'attribution', 'badges', 'clean']
    for k in maint_keys:
        if k in task:
            score -= 20
            factors.append(f"Maintenance ({k}): -20")

    # 2. Product Feature Development (Low-Medium)
    dev_keys = ['feature', 'test', 'api', 'service', 'frontend', 'ui', 'component', 'endpoint', 'controller']
    for k in dev_keys:
        if k in task:
            score += 4
            factors.append(f"Product Dev ({k}): +4")

    # 3. Governance & Complex Logic (High)
    logic_keys = ['algorithm', 'refactor', 'optimization', 'performance', 'logic', 'module', 'race condition', 'concurrency', 'governance', 'policy', 'opa', 'risk score']
    for k in logic_keys:
        if k in task:
            score += 10
            factors.append(f"Logic ({k}): +10")

    # 4. Strategic Architecture (Critical)
    arch_keys = ['architect', 'design', 'multi-service', 'system', 'structure', 'planning', 'repository', 'traceability', 'strategy', 'security', 'infrastructure', 'oci', 'redpanda', 'kafka', 'baseline']
    for k in arch_keys:
        if k in task:
            score += 15
            factors.append(f"Architecture ({k}): +15")

    # 5. Diagnostic & Research
    research_keys = ['research', 'explain', 'search', 'find', 'best practices', 'summarize', 'scan', 'debug', 'bug', 'error', 'fails']
    for k in research_keys:
        if k in task:
            score += 5
            factors.append(f"Research/Debug ({k}): +5")

    # --- TIER MAPPING ---
    # Score Thresholds:
    # >= 25: Elite (Opus)
    # >= 15: Critical (Sonnet)
    # >= 8: Advanced (Pro High)
    # >= 3: Enhanced (Pro Low)
    # < 3: Standard (Flash)

    if score >= 25:
        primary = models_dict.get('claude-opus-4-6-thinking', models_dict.get('claude-sonnet-4-6-thinking'))
    elif score >= 15:
        primary = models_dict.get('claude-sonnet-4-6-thinking', models_dict.get('gemini-3-1-pro-high'))
    elif score >= 8:
        primary = models_dict.get('gemini-3-1-pro-high', models_dict.get('gemini-3-1-pro-low'))
    elif score >= 3:
        primary = models_dict.get('gemini-3-1-pro-low', models_dict.get('gemini-3-flash'))
    else:
        primary = models_dict.get('gemini-3-flash')

    # Force Elite if --critical flag is used ON high-score tasks
    if critical and score >= 15:
        primary = models_dict.get('claude-opus-4-6-thinking', primary)

    # Fail-safe
    if not primary:
        primary = models_dict.get('gemini-3-flash')

    # --- DECISION ENGINE: Quota Check ---
    quota = primary.get('quota', 1.0)
    final_model = primary
    fallback_active = False
    intended_model_name = None

    if quota < 0.15 and not critical:
        fallback = find_fallback(primary['id'])
        if fallback and fallback['id'] != primary['id']:
            intended_model_name = primary['name']
            final_model = fallback
            fallback_active = True

    return {
        "model": final_model,
        "is_fallback": fallback_active,
        "score": score,
        "factors": factors,
        "intended": intended_model_name
    }

def main():
    parser = argparse.ArgumentParser(description="Advanced Antigravity Model Selection Engine")
    parser.add_argument("--task", required=False, help="Description of the task to perform")
    parser.add_argument("--sync", action="store_true", help="Force a refresh of the model registry")
    parser.add_argument("--critical", action="store_true", help="Force primary model usage even if quota is low")
    args = parser.parse_args()

    registry = load_registry()
    if not registry:
        print("Error: Model Registry (models.json) not found.")
        sys.exit(1)

    if args.sync:
        print("Explicitly triggering Model Registry sync...")
        daemon_path = os.path.join(os.path.dirname(__file__), 'sync-daemon.py')
        subprocess.run([sys.executable, daemon_path])
        # Reload after sync to get new results
        registry = load_registry()
        print(f"Successfully synced registry (Version {registry.get('version', 'unknown')}).")
        sys.exit(0)

    # Shadow Sync (Auto-background)
    if check_for_updates(registry):
        print("[MODELOPS] Background sync initiated (Registry older than 24h).")

    if not args.task:
        parser.print_help()
        sys.exit(0)

    result = get_recommendation(args.task, registry, critical=args.critical)
    rec = result['model']
    is_fallback = result['is_fallback']
    score = result['score']
    factors = result['factors']
    intended = result['intended']
    
    # Model Attribution Output (Uniform Badge)
    print("=" * 60)
    print(f" MODEL IN USE: {rec['name']} ".center(60, "="))
    print("=" * 60)
    print(f"TIER              : {rec['tier']}")
    print(f"PLATFORM ID       : {rec['id']}")
    print(f"QUOTA REMAINING   : {rec.get('quota', 1.0)*100:.1f}%")
    if is_fallback:
        print(f"STATUS            : GRACEFUL DEGRADATION ACTIVE (Intended: {intended})")
    elif args.critical:
        print(f"STATUS            : CRITICAL OVERRIDE (Quota Buffer Ignored)")
    else:
        print(f"STATUS            : OPTIMAL")
    print("-" * 60)
    print(f"TASK CONTEXT      : {args.task[:50]}{'...' if len(args.task) > 50 else ''}")
    print(f"LIFECYCLE SCORE   : {score}")
    print(f"ROUTING FACTORS   : {', '.join(factors)}")
    print(f"QUOTA IMPACT      : {'*' * rec['cost_rank']}")
    print("-" * 60)
    print(f"DESCRIPTION       : {rec['description']}")
    print("-" * 60)

if __name__ == "__main__":
    main()
