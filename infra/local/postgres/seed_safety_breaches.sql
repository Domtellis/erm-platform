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

INSERT INTO monitoring."Outbox" (id, type, payload, occurred_at)
VALUES (
    gen_random_uuid(),
    'erm.monitoring.breach-detected.v1',
    jsonb_build_object(
        'breach_case_id', 'safe-001',
        'bu_id', 'BU-PACIFIC',
        'category', 'Safety',
        'severity', 'critical',
        'title', 'CRITICAL: High Wind Gusts at Quay 4',
        'detected_at', NOW() - INTERVAL '30 minutes'
    ),
    NOW() - INTERVAL '30 minutes'
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

INSERT INTO monitoring."Outbox" (id, type, payload, occurred_at)
VALUES (
    gen_random_uuid(),
    'erm.monitoring.breach-detected.v1',
    jsonb_build_object(
        'breach_case_id', 'safe-002',
        'bu_id', 'BU-ATLANTIC',
        'category', 'Safety',
        'severity', 'high',
        'title', 'Stack Height Exceedance (Block B)',
        'detected_at', NOW() - INTERVAL '2 hours'
    ),
    NOW() - INTERVAL '2 hours'
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

INSERT INTO monitoring."Outbox" (id, type, payload, occurred_at)
VALUES (
    gen_random_uuid(),
    'erm.monitoring.breach-detected.v1',
    jsonb_build_object(
        'breach_case_id', 'safe-003',
        'bu_id', 'BU-PACIFIC',
        'category', 'Safety',
        'severity', 'medium',
        'title', 'Air Quality Warning: Bulk Terminal',
        'detected_at', NOW() - INTERVAL '15 minutes'
    ),
    NOW() - INTERVAL '15 minutes'
);

-- 4. Traffic Collision Risk (Vehicle Safety)
INSERT INTO monitoring."BreachCase" (id, site_id, bu_id, title, metric_name, observed_value, severity, status, created_at, updated_at, triage_due_at, decision_due_at, closure_due_at, closed_at)
VALUES (
    'safe-004',
    'PORT-AUTO-03',
    'BU-ATLANTIC',
    'Proximity Alert Cluster: Zone D',
    'prox_alert_count',
    12,
    'low',
    'closed',
    NOW() - INTERVAL '4 hours',
    NOW(),
    NOW() + INTERVAL '4 hours',
    NOW() + INTERVAL '44 hours',
    NOW() + INTERVAL '29 days',
    NOW() - INTERVAL '10 minutes'
);

INSERT INTO monitoring."Outbox" (id, type, payload, occurred_at, processed_at)
VALUES (
    gen_random_uuid(),
    'erm.monitoring.breach-detected.v1',
    jsonb_build_object(
        'breach_case_id', 'safe-004',
        'bu_id', 'BU-ATLANTIC',
        'category', 'Safety',
        'severity', 'low',
        'title', 'Proximity Alert Cluster: Zone D',
        'detected_at', NOW() - INTERVAL '4 hours'
    ),
    NOW() - INTERVAL '4 hours',
    NOW()
);

INSERT INTO monitoring."Outbox" (id, type, payload, occurred_at, processed_at)
VALUES (
    gen_random_uuid(),
    'erm.monitoring.breach-closed.v1',
    jsonb_build_object(
        'breach_case_id', 'safe-004',
        'closed_at', NOW() - INTERVAL '10 minutes'
    ),
    NOW() - INTERVAL '10 minutes',
    NOW()
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

INSERT INTO monitoring."Outbox" (id, type, payload, occurred_at)
VALUES (
    gen_random_uuid(),
    'erm.monitoring.breach-detected.v1',
    jsonb_build_object(
        'breach_case_id', 'safe-005',
        'bu_id', 'BU-PACIFIC',
        'category', 'Safety',
        'severity', 'medium',
        'title', 'Shift Fatigue Limit Approaching',
        'detected_at', NOW()
    ),
    NOW()
);
