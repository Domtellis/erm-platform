import pytest
from model_router import get_recommendation

# --- MOCK DATA ---
@pytest.fixture
def mock_registry():
    """
    Provides a predictable registry state for testing.
    - Elite has NO quota.
    - Critical has quota.
    - Advanced has NO quota.
    - Enhanced has quota.
    - Standard has quota.
    """
    return {
        "version": "1.3.0",
        "models": [
            {
                "id": "claude-opus-4-6-thinking",
                "name": "Claude Opus 4.6",
                "tier": "Elite",
                "quota": 0.0  # OUT OF QUOTA
            },
            {
                "id": "claude-sonnet-4-6-thinking",
                "name": "Claude Sonnet 4.6",
                "tier": "Critical",
                "quota": 0.8  # HAS QUOTA
            },
            {
                "id": "gemini-3-1-pro-high",
                "name": "Gemini 3.1 Pro (High)",
                "tier": "Advanced",
                "quota": 0.0  # OUT OF QUOTA
            },
            {
                "id": "gemini-3-1-pro-low",
                "name": "Gemini 3.1 Pro (Low)",
                "tier": "Enhanced",
                "quota": 1.0  # HAS QUOTA
            },
            {
                "id": "gemini-3-flash",
                "name": "Gemini 3 Flash",
                "tier": "Standard",
                "quota": 1.0  # HAS QUOTA
            }
        ]
    }

# --- TESTS ---

def test_regex_word_boundaries(mock_registry):
    """Ensure substrings don't trigger the wrong routing rules."""
    
    # 'cleaner' should NOT trigger the 'clean' (-20) penalty.
    # 'component' should trigger product dev (+4).
    result_safe = get_recommendation("build a cleaner component", mock_registry)
    assert result_safe['score'] == 4
    assert result_safe['error'] is False

    # 'clean' as a distinct word SHOULD trigger the penalty (-20).
    result_penalty = get_recommendation("clean the component", mock_registry)
    assert result_penalty['score'] == -16


def test_graceful_degradation(mock_registry):
    """Ensure a task degrades to the next available tier if primary is out of quota."""
    
    # "architect system logic performance" = architect(+15) + system(+15) + logic(+10) + performance(+10) = 50 (Elite target)
    # Elite quota is 0.0 in our mock. It should gracefully degrade to Critical.
    result = get_recommendation("architect a new system with complex logic performance", mock_registry)
    
    assert result['error'] is False
    assert result['is_fallback'] is True
    assert result['model']['tier'] == "Critical"
    assert result['intended'] == "Claude Opus 4.6"


def test_hard_fail_safety(mock_registry):
    """Ensure the router halts if it drops below the min_tier_idx."""
    
    # Exhaust both Critical and Advanced quotas for this test
    exhausted_registry = mock_registry.copy()
    exhausted_registry["models"][1]["quota"] = 0.0 # Critical (Sonnet) out of quota
    exhausted_registry["models"][2]["quota"] = 0.0 # Advanced (Gemini High) out of quota
    
    # Task scores 50. Target: Elite. Floor: Advanced.
    # Elite (0), Critical (0), Advanced (0).
    # It should NOT drop to Enhanced. It should hard fail.
    result = get_recommendation("architect a new system with complex logic performance", exhausted_registry)
    
    assert result.get('error') is True
    assert "HARD FAIL" in result['message']
    assert "Advanced" in result['message']


def test_plan_flag_override(mock_registry):
    """Ensure the --plan flag forces a high score and routes to a thinking model."""
    
    # "fix UI bug" normally scores: UI (+4) + bug (+5) = 9 (Advanced Target)
    # With plan_only=True, it adds +30 -> Total 39 (Elite Target)
    result = get_recommendation("fix UI bug", mock_registry, plan_only=True)
    
    assert result['score'] >= 30
    assert "Explicit Strategy/Plan mode: +30" in result['factors']
    # Elite is out of quota, so it should fall back to Critical (Sonnet)
    assert result['model']['tier'] == "Critical"


def test_critical_flag_override(mock_registry):
    """Ensure --critical flag sets target to Elite, but still obeys quota safety nets."""
    
    # Task normally scores 15 (Advanced Target). 
    # With critical=True, it jumps to Elite Target.
    # Because Elite has 0.0 quota, it must still safely degrade to Critical.
    result = get_recommendation("architect a database", mock_registry, critical=True)
    
    assert result['error'] is False
    assert result['is_fallback'] is True  # It correctly fell back due to 0 quota
    assert result['model']['tier'] == "Critical" # Landed safely on the next tier down
    assert "Critical Flag Passed: Forced Elite" in result['factors']