import sys
import argparse
import json
import os
import subprocess
import re
from datetime import datetime, timedelta, timezone

REGISTRY_PATH = os.path.join(os.path.dirname(__file__), 'models.json')
REFRESH_INTERVAL_HOURS = 1  # Dynamic Quota Snapshot refresh

def load_registry():
    if not os.path.exists(REGISTRY_PATH):
        return None
    with open(REGISTRY_PATH, 'r') as f:
        return json.load(f)

def trigger_shadow_sync():
    """Launches sync-daemon.py in the background without blocking."""
    daemon_path = os.path.join(os.path.dirname(__file__), 'sync_daemon.py')
    try:
        if os.name == 'nt':  # Windows
            subprocess.Popen([sys.executable, daemon_path], 
                             creationflags=subprocess.CREATE_NO_WINDOW | subprocess.DETACHED_PROCESS)
        else:
            subprocess.Popen([sys.executable, daemon_path], 
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    except Exception as e:
        pass

def check_for_updates(registry):
    """
    Checks if the registry is stale (> 24h) and triggers shadow sync.
    Returns True if a sync was triggered.
    """
    last_updated_str = registry.get('last_updated')
    if not last_updated_str:
        trigger_shadow_sync()
        return True
        
    try:
        cleaned_time = last_updated_str.replace('Z', '')
        last_updated = datetime.fromisoformat(cleaned_time)
        if last_updated < datetime.now(timezone.utc) - timedelta(hours=REFRESH_INTERVAL_HOURS):
            trigger_shadow_sync()
            return True
    except:
        trigger_shadow_sync()
        return True
    return False

def get_recommendation(task, registry, critical=False, plan_only=False):
    models_list = registry['models']
    models_dict = {m['id']: m for m in models_list}
    
    # helper for fallback
    def find_fallback(current_tier, min_tier_idx):
        tiers = ["Elite", "Critical", "Advanced", "Enhanced", "Standard"]
        try:
            start_idx = tiers.index(current_tier)
            # Try degrading one step at a time, but stop at min_tier_idx
            for next_tier in tiers[start_idx:]:
                if tiers.index(next_tier) > min_tier_idx:
                    break # Reached the absolute floor for this complexity
                
                for m in models_list:
                    if m['tier'] == next_tier and m.get('quota', 0.0) >= 0.15:
                        return m
        except ValueError:
            pass
        return None

    # Helper for exact word matching using Regex
    def check_keywords(text, keys):
        pattern = r'\b(?:' + '|'.join(map(re.escape, keys)) + r')\b'
        matches = re.findall(pattern, text, flags=re.IGNORECASE)
        return list(set(matches)) # Return unique matches

    # --- LIFECYCLE-AWARE WEIGHTED SCORING ---
    score = 0
    factors = []

    if plan_only:
        score += 30
        factors.append("Explicit Strategy/Plan mode: +30")

    # 1. Maintenance & Housekeeping (Strong Penalty)
    maint_keys = ['cleanup', 'delete', 'remove', 'format', 'organize', 'formalize', 'temporary', 'unused', 'ledger', 'attribution', 'badges', 'clean']
    matched_maint = check_keywords(task, maint_keys)
    if matched_maint:
        score -= 20
        factors.append(f"Maintenance ({', '.join(matched_maint)}): -20")

    # 2. Product Feature Development (Low-Medium)
    dev_keys = ['feature', 'test', 'api', 'service', 'frontend', 'ui', 'component', 'endpoint', 'controller']
    matched_dev = check_keywords(task, dev_keys)
    if matched_dev:
        score += 4
        factors.append(f"Product Dev ({', '.join(matched_dev)}): +4")

    # 3. Governance & Complex Logic (High)
    logic_keys = ['algorithm', 'refactor', 'optimization', 'performance', 'logic', 'module', 'race condition', 'concurrency', 'governance', 'policy', 'opa', 'risk score']
    matched_logic = check_keywords(task, logic_keys)
    if matched_logic:
        score += 10
        factors.append(f"Logic ({', '.join(matched_logic)}): +10")

    # 4. Strategic Architecture (Critical)
    arch_keys = ['architect', 'design', 'multi-service', 'system', 'structure', 'planning', 'repository', 'traceability', 'strategy', 'security', 'infrastructure', 'oci', 'redpanda', 'kafka', 'baseline']
    matched_arch = check_keywords(task, arch_keys)
    if matched_arch:
        score += 15
        factors.append(f"Architecture ({', '.join(matched_arch)}): +15")

    # 5. Diagnostic & Research
    research_keys = ['research', 'explain', 'search', 'find', 'best practices', 'summarize', 'scan', 'debug', 'bug', 'error', 'fails']
    matched_research = check_keywords(task, research_keys)
    if matched_research:
        score += 5
        factors.append(f"Research/Debug ({', '.join(matched_research)}): +5")

    # --- TIER MAPPING & FLOORS ---
    tiers = ["Elite", "Critical", "Advanced", "Enhanced", "Standard"]
    
    if score >= 25:
        target_tier = "Elite"
        min_tier_idx = 2 # Do not drop below Advanced for highly complex tasks
        primary = models_dict.get('claude-opus-4-6-thinking', models_dict.get('claude-sonnet-4-6-thinking'))
    elif score >= 15:
        target_tier = "Critical"
        min_tier_idx = 3 # Do not drop below Enhanced
        primary = models_dict.get('claude-sonnet-4-6-thinking', models_dict.get('gemini-3-1-pro-high'))
    elif score >= 8:
        target_tier = "Advanced"
        min_tier_idx = 4 # Can drop to Standard
        primary = models_dict.get('gemini-3-1-pro-high', models_dict.get('gemini-3-1-pro-low'))
    elif score >= 3:
        target_tier = "Enhanced"
        min_tier_idx = 4
        primary = models_dict.get('gemini-3-1-pro-low', models_dict.get('gemini-3-flash'))
    else:
        target_tier = "Standard"
        min_tier_idx = 4
        primary = models_dict.get('gemini-3-flash')

    # Force Elite if --critical flag is used ON high-score tasks
    if critical and score >= 15:
        primary = models_dict.get('claude-opus-4-6-thinking', primary)
        target_tier = "Elite"

    # --- DECISION ENGINE: Quota Check ---
    # Safe check in case `primary` somehow mapped to None
    if not primary:
        primary = models_dict.get('gemini-3-flash')

    quota = primary.get('quota', 0.0)
    final_model = primary
    fallback_active = False
    intended_model_name = None

    if quota < 0.15 and not critical:
        fallback = find_fallback(target_tier, min_tier_idx)
        
        # Hard Fail: If no suitable fallback is found, stop the pipeline.
        if not fallback:
            return {
                "error": True,
                "message": f"CRITICAL: All viable models for this task complexity (Floor: {tiers[min_tier_idx]}) have exhausted their quota. Pipeline halted to prevent degradation."
            }
            
        if fallback['id'] != primary['id']:
            intended_model_name = primary['name']
            final_model = fallback
            fallback_active = True

    return {
        "error": False,
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
    parser.add_argument("--plan", action="store_true", help="Force routing to a 'Thinking' model for architectural planning")
    args = parser.parse_args()

    registry = load_registry()
    if not registry:
        print("Error: Model Registry (models.json) not found.")
        sys.exit(1)

    if args.sync:
        print("Explicitly triggering Model Registry sync...")
        daemon_path = os.path.join(os.path.dirname(__file__), 'sync_daemon.py')
        try:
            subprocess.run([sys.executable, daemon_path])
            # Reload after sync to get new results
            registry = load_registry()
            print(f"Successfully synced registry (Version {registry.get('version', 'unknown')}).")
        except Exception as e:
            print(f"Sync failed: {e}")
        # Note: sys.exit(0) removed here so `--task` can still run

    if not args.task:
        # If they only passed --sync, exit cleanly now. Otherwise, show help.
        if args.sync:
            sys.exit(0)
        parser.print_help()
        sys.exit(0)

    # Shadow Sync (Auto-background)
    if not args.sync and check_for_updates(registry):
        print("[MODELOPS] WARNING: Background sync initiated. Routing based on cached registry.")

    result = get_recommendation(args.task, registry, critical=args.critical, plan_only=args.plan)
    
    # Handle the Hard Fail scenario
    if result.get("error"):
        print("\n" + "!" * 60)
        print(" MODEL ROUTING FAILED ".center(60, "!"))
        print("!" * 60)
        print(result["message"])
        sys.exit(1)

    rec = result['model']
    is_fallback = result['is_fallback']
    score = result['score']
    factors = result['factors']
    intended = result['intended']
    
    # Model Attribution Output (Uniform Badge)
    print("\n" + "=" * 60)
    print(f" MODEL IN USE: {rec['name']} ".center(60, "="))
    print("=" * 60)
    print(f"TIER              : {rec['tier']}")
    print(f"PLATFORM ID       : {rec['id']}")
    print(f"QUOTA REMAINING   : {rec.get('quota', 0.0)*100:.1f}%")
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
    print(f"QUOTA IMPACT      : {'*' * rec.get('cost_rank', 1)}")
    print("-" * 60)
    print(f"DESCRIPTION       : {rec['description']}")
    print("-" * 60)

if __name__ == "__main__":
    main()