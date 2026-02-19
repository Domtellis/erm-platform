-- Clean existing data (Monitoring Schema)
TRUNCATE TABLE monitoring."Evaluation" CASCADE;
TRUNCATE TABLE monitoring."BreachCase" CASCADE;
TRUNCATE TABLE monitoring."Outbox" CASCADE;

-- Insert Seed Data: Ports & Terminals Safety Breaches (ISO 45001)

-- 1. High Wind Event (Crane Safety)
INSERT INTO monitoring."BreachCase" (id, site_id, bu_id, title, metric_name, observed_value, severity, status, created_at, updated_at, triage_due_at, decision_due_at, closure_due_at)
VALUES (
    'safe-001',
    'PORT-TERM-04',
    'BU-PACIFIC',
    'CRITICAL: High Wind Gusts at Quay 4',
    'wind_speed_knots',
    48.5,
    'critical',
    'open',
    NOW() - INTERVAL '30 minutes',
    NOW(),
    NOW() + INTERVAL '30 minutes',
    NOW() + INTERVAL '7 hours',
    NOW() + INTERVAL '6 days'
);

-- 2. Dangerous Stacking (Stability)
INSERT INTO monitoring."BreachCase" (id, site_id, bu_id, title, metric_name, observed_value, severity, status, created_at, updated_at, triage_due_at, decision_due_at, closure_due_at)
VALUES (
    'safe-002',
    'PORT-LOG-02',
    'BU-ATLANTIC',
    'Stack Height Exceedance (Block B)',
    'container_stack_height',
    7,
    'high',
    'open',
    NOW() - INTERVAL '2 hours',
    NOW(),
    NOW() - INTERVAL '1 hour',  -- Overdue Triage
    NOW() + INTERVAL '6 hours',
    NOW() + INTERVAL '6 days'
);

-- 3. PM 2.5 Air Quality (Health)
INSERT INTO monitoring."BreachCase" (id, site_id, bu_id, title, metric_name, observed_value, severity, status, created_at, updated_at, triage_due_at, decision_due_at, closure_due_at)
VALUES (
    'safe-003',
    'PORT-BULK-01',
    'BU-PACIFIC',
    'Air Quality Warning: Bulk Terminal',
    'pm_25_level',
    155.0,
    'medium',
    'open',
    NOW() - INTERVAL '15 minutes',
    NOW(),
    NOW() + INTERVAL '2 hours',
    NOW() + INTERVAL '23 hours',
    NOW() + INTERVAL '13 days'
);

-- 4. Traffic Collision Risk (Vehicle Safety)
INSERT INTO monitoring."BreachCase" (id, site_id, bu_id, title, metric_name, observed_value, severity, status, created_at, updated_at, triage_due_at, decision_due_at, closure_due_at)
VALUES (
    'safe-004',
    'PORT-AUTO-03',
    'BU-ATLANTIC',
    'Proximity Alert Cluster: Zone D',
    'prox_alert_count',
    12,
    'low',
    'open',
    NOW() - INTERVAL '4 hours',
    NOW(),
    NOW() + INTERVAL '4 hours',
    NOW() + INTERVAL '44 hours',
    NOW() + INTERVAL '29 days'
);

-- 5. Fatigue Index (Workforce Safety)
INSERT INTO monitoring."BreachCase" (id, site_id, bu_id, title, metric_name, observed_value, severity, status, created_at, updated_at, triage_due_at, decision_due_at, closure_due_at)
VALUES (
    'safe-005',
    'PORT-TERM-01',
    'BU-PACIFIC',
    'Shift Fatigue Limit Approaching',
    'worker_fatigue_index',
    8.2,
    'medium',
    'open',
    NOW(),
    NOW(),
    NOW() + INTERVAL '3 hours',
    NOW() + INTERVAL '24 hours',
    NOW() + INTERVAL '14 days'
);
