-- Add SLA completion timestamp columns to BreachCase table
ALTER TABLE monitoring."BreachCase" 
ADD COLUMN IF NOT EXISTS "triage_completed_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "decision_approved_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "closed_at" TIMESTAMP(3);
