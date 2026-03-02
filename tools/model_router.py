import json
import sys
import os
import re
import argparse
import subprocess
from datetime import datetime, timezone

MODELS_PATH = os.path.join(os.path.dirname(__file__), 'models.json')
TIERS = ["Elite", "Critical", "Advanced", "Enhanced", "Standard"]

def load_registry():
    try:
        with open(MODELS_PATH, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading registry: {e}")
        return None

def trigger_shadow_sync():
    """Silently triggers the background sync daemon."""
    daemon_path = os.path.join(os.path.dirname(__file__), 'sync_daemon.py')
    if os.path.exists(daemon_path):
        subprocess.Popen([sys.executable, daemon_path], 
                         stdout=subprocess.DEVNULL, 
                         stderr=subprocess.DEVNULL,
                         creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)

def check_keywords(text, keywords):
    """Uses regex word boundaries to prevent substring collisions (clean vs cleaner)."""
    text_lower = text.lower()
    matches = []
    for kw in keywords:
        pattern = r'\b' + re.escape(kw) + r'\b'
        if re.search(pattern, text_lower):
            matches.append(kw)
    return matches

def parse_slash_commands(task_string):
    """
    Looks for '/select-model [model-id-or-tier]' in the prompt.
    Returns the requested override and the cleaned prompt.
    """
    match = re.search(r'/select-model\s+([a-zA-Z0-9\-\.]+)', task_string, re.IGNORECASE)
    if match:
        override_value = match.group(1).lower()
        # Remove the command from the task so the AI doesn't see it
        clean_task = re.sub(r'/select-model\s+[a-zA-Z0-9\-\.]+', '', task_string, flags=re.IGNORECASE).strip()
        return override_value, clean_task
    return None, task_string

def get_recommendation(task, registry, critical=False, plan_only=False):
    models_list = registry['models']
    
    # 1. Parse for manual overrides first
    override_req, clean_task = parse_slash_commands(task)
    task_to_score = clean_task # The AI will only see this part
    
    score = 0
    factors = []
    target_tier = "Standard"
    min_tier_idx = 4 # Default to Standard floor

    # --- MANUAL OVERRIDE BYPASS ---
    override_matched = False
    if override_req:
        # Check if it matches an exact ID or a Tier name
        for m in models_list:
            if m['id'].lower() == override_req or m['tier'].lower() == override_req:
                target_tier = m['tier']
                min_tier_idx = TIERS.index(target_tier)
                score = "OVERRIDE"
                factors.append(f"Explicit Override Requested: {override_req}")
                override_matched = True
                break
        
        if not override_matched:
            factors.append(f"Warning: Override '{override_req}' not found. Falling back to Auto-Scoring.")

    # --- LIFECYCLE-AWARE WEIGHTED SCORING (Only if no valid override) ---
    if not override_matched:
        if plan_only:
            score += 30
            factors.append("Explicit Strategy/Plan mode: +30")

        maint_keys = ['cleanup', 'delete', 'remove', 'format', 'organize', 'formalize', 'temporary', 'unused', 'ledger', 'attribution', 'badges', 'clean']
        matched_maint = check_keywords(task_to_score, maint_keys)
        if matched_maint:
            points = 20 * len(matched_maint)
            score -= points
            factors.append(f"Maintenance ({', '.join(matched_maint)}): -{points}")

        dev_keys = ['feature', 'test', 'api', 'service', 'frontend', 'ui', 'component', 'endpoint', 'controller']
        matched_dev = check_keywords(task_to_score, dev_keys)
        if matched_dev:
            points = 4 * len(matched_dev)
            score += points
            factors.append(f"Product Dev ({', '.join(matched_dev)}): +{points}")

        logic_keys = ['algorithm', 'refactor', 'optimization', 'performance', 'logic', 'module', 'race condition', 'concurrency', 'governance', 'policy', 'opa', 'risk score']
        matched_logic = check_keywords(task_to_score, logic_keys)
        if matched_logic:
            points = 10 * len(matched_logic)
            score += points
            factors.append(f"Logic ({', '.join(matched_logic)}): +{points}")

        arch_keys = ['architect', 'design', 'multi-service', 'system', 'structure', 'planning', 'repository', 'traceability', 'strategy', 'security', 'infrastructure', 'oci', 'redpanda', 'kafka', 'baseline']
        matched_arch = check_keywords(task_to_score, arch_keys)
        if matched_arch:
            points = 15 * len(matched_arch)
            score += points
            factors.append(f"Architecture ({', '.join(matched_arch)}): +{points}")

        research_keys = ['research', 'explain', 'search', 'find', 'best practices', 'summarize', 'scan', 'debug', 'bug', 'error', 'fails']
        matched_research = check_keywords(task_to_score, research_keys)
        if matched_research:
            points = 5 * len(matched_research)
            score += points
            factors.append(f"Research/Debug ({', '.join(matched_research)}): +{points}")

        # Map score to Tier
        if critical or score >= 40:
            target_tier = "Elite"
            min_tier_idx = 2  # Hard fail if drops below Advanced
            if critical: factors.append("Critical Flag Passed: Forced Elite")
        elif score >= 20:
            target_tier = "Critical"
            min_tier_idx = 3  # Hard fail if drops below Enhanced
        elif score >= 10:
            target_tier = "Advanced"
            min_tier_idx = 4  # Can drop to Standard
        elif score >= 0:
            target_tier = "Enhanced"
            min_tier_idx = 4
        else:
            target_tier = "Standard"
            min_tier_idx = 4

    # --- GRACEFUL DEGRADATION & HARD FAILS ---
    start_idx = TIERS.index(target_tier)
    intended_model_name = None

    for i in range(start_idx, min_tier_idx + 1):
        current_tier = TIERS[i]
        tier_models = [m for m in models_list if m['tier'] == current_tier]
        
        for model in tier_models:
            if intended_model_name is None:
                intended_model_name = model['name'] # Capture what we originally wanted
                
            if model.get('quota', 0.0) > 0.0:
                is_fallback = (i > start_idx)
                return {
                    "error": False,
                    "model": model,
                    "score": score,
                    "factors": factors,
                    "is_fallback": is_fallback,
                    "intended": intended_model_name,
                    "clean_task": task_to_score
                }

    # If we exit the loop, we hit a Hard Fail
    return {
        "error": True,
        "message": f"HARD FAIL: Task requires minimum tier '{TIERS[min_tier_idx]}'. All models at or above this tier are out of quota.",
        "score": score,
        "factors": factors
    }

def main():
    parser = argparse.ArgumentParser(description="Antigravity Model Router")
    parser.add_argument('--task', type=str, help="The prompt/task description")
    parser.add_argument('--critical', action='store_true', help="Force Elite tier mapping")
    parser.add_argument('--plan', action='store_true', help="Force Strategic planning mode")
    parser.add_argument('--sync', action='store_true', help="Force sync with live quotas")
    
    args = parser.parse_args()

    if args.sync:
        print("Explicitly triggering Model Registry sync...")
        daemon_path = os.path.join(os.path.dirname(__file__), 'sync_daemon.py')
        subprocess.run([sys.executable, daemon_path])
        registry = load_registry()
        if registry:
            print(f"Successfully synced registry (Version {registry.get('version', 'Unknown')}).")
        sys.exit(0)

    if not args.task:
        parser.print_help()
        sys.exit(1)

    # Trigger shadow sync for future runs
    trigger_shadow_sync()

    registry = load_registry()
    if not registry:
        sys.exit(1)

    result = get_recommendation(args.task, registry, critical=args.critical, plan_only=args.plan)

    if result.get("error"):
        print(f"\n[!] {result['message']}")
        sys.exit(1)

    model = result['model']
    
    print(f"QUOTA REMAINING   : {model.get('quota', 0) * 100}%")
    if result['is_fallback']:
        print(f"STATUS            : GRACEFUL DEGRADATION ACTIVE (Intended: {result['intended']})")
    else:
        print(f"STATUS            : OPTIMAL ROUTING")
    print("-" * 60)
    print(f"CLEAN TASK        : {result['clean_task'][:50]}..." if len(result['clean_task']) > 50 else f"CLEAN TASK        : {result['clean_task']}")
    print(f"LIFECYCLE SCORE   : {result['score']}")
    print(f"ROUTING FACTORS   : {', '.join(result['factors'])}")
    print(f"MODEL IN USE      : {model['name']} ({model['tier']})")
    print("-" * 60)
    print(f"DESCRIPTION       : {model['description']}")
    print("-" * 60)

if __name__ == "__main__":
    main()