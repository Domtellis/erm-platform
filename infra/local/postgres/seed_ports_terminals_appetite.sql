-- ISO 31000: Ports & Terminals Appetite & Thresholds
-- Aligned with historical synthetic validation dataset

CREATE SCHEMA IF NOT EXISTS appetite;

-- Ensure tables exist for seeding
CREATE TABLE IF NOT EXISTS appetite."AppetiteStatement" (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    version TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appetite."Threshold" (
    id TEXT PRIMARY KEY,
    appetite_id TEXT NOT NULL REFERENCES appetite."AppetiteStatement"(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    operator TEXT NOT NULL,
    limit_value DOUBLE PRECISION NOT NULL,
    severity_mapping JSONB NOT NULL
);

-- 1. Create the Appetite Statement
INSERT INTO appetite."AppetiteStatement" (id, title, description, category, version, is_active, created_at, updated_at)
VALUES (
    'appetite-ports-terminals-v1',
    'Ports & Terminals Integrated Safety & Ops Appetite',
    'Standardized thresholds for maritime and landside operations based on ISO 31000 and ISO 45001.',
    'safety',
    '1.0.0',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- 2. Insert Thresholds
-- Wind Speed (Knots) - Critical above 35.0
INSERT INTO appetite."Threshold" (id, appetite_id, metric_name, operator, limit_value, severity_mapping)
VALUES (
    'thresh-wind-001',
    'appetite-ports-terminals-v1',
    'wind_speed_knots',
    '>',
    35.0,
    '{"low": 20, "medium": 25, "high": 30, "critical": 35}'
);

-- Container Stack Height - Critical above 5.0
INSERT INTO appetite."Threshold" (id, appetite_id, metric_name, operator, limit_value, severity_mapping)
VALUES (
    'thresh-stack-001',
    'appetite-ports-terminals-v1',
    'container_stack_height',
    '>',
    5.0,
    '{"low": 3, "medium": 4, "high": 5}'
);

-- worker_fatigue_index - Critical above 7.0
INSERT INTO appetite."Threshold" (id, appetite_id, metric_name, operator, limit_value, severity_mapping)
VALUES (
    'thresh-fatigue-001',
    'appetite-ports-terminals-v1',
    'worker_fatigue_index',
    '>',
    7.0,
    '{"low": 5, "medium": 6, "high": 7, "critical": 8}'
);

-- pm_25_level - Critical above 100.0
INSERT INTO appetite."Threshold" (id, appetite_id, metric_name, operator, limit_value, severity_mapping)
VALUES (
    'thresh-pm25-001',
    'appetite-ports-terminals-v1',
    'pm_25_level',
    '>',
    100.0,
    '{"low": 25, "medium": 50, "high": 75, "critical": 100}'
);

-- prox_alert_count - High above 10.0
INSERT INTO appetite."Threshold" (id, appetite_id, metric_name, operator, limit_value, severity_mapping)
VALUES (
    'thresh-prox-001',
    'appetite-ports-terminals-v1',
    'prox_alert_count',
    '>',
    10.0,
    '{"low": 5, "medium": 8, "high": 10}'
);

-- chemical_spill_litres - Critical above 50.0
INSERT INTO appetite."Threshold" (id, appetite_id, metric_name, operator, limit_value, severity_mapping)
VALUES (
    'thresh-spill-001',
    'appetite-ports-terminals-v1',
    'chemical_spill_litres',
    '>',
    50.0,
    '{"low": 1, "medium": 10, "high": 25, "critical": 50}'
);

-- crane_load_percentage - Critical above 100.0
INSERT INTO appetite."Threshold" (id, appetite_id, metric_name, operator, limit_value, severity_mapping)
VALUES (
    'thresh-crane-001',
    'appetite-ports-terminals-v1',
    'crane_load_percentage',
    '>',
    100.0,
    '{"medium": 80, "high": 90, "critical": 100}'
);

-- fire_suppression_pressure_bar - Critical below 4.0
INSERT INTO appetite."Threshold" (id, appetite_id, metric_name, operator, limit_value, severity_mapping)
VALUES (
    'thresh-fire-001',
    'appetite-ports-terminals-v1',
    'fire_suppression_pressure_bar',
    '<',
    4.0,
    '{"high": 5, "critical": 4}'
);

-- spill_response_time_minutes - High above 20.0
INSERT INTO appetite."Threshold" (id, appetite_id, metric_name, operator, limit_value, severity_mapping)
VALUES (
    'thresh-spillresp-001',
    'appetite-ports-terminals-v1',
    'spill_response_time_minutes',
    '>',
    20.0,
    '{"medium": 15, "high": 20}'
);
