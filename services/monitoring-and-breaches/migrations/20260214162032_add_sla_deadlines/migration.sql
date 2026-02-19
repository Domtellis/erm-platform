-- CreateTable
CREATE TABLE "monitoring"."BreachCase" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "site_id" TEXT NOT NULL,
    "metric_name" TEXT NOT NULL,
    "observed_value" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "severity" TEXT,
    "bu_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "triage_due_at" TIMESTAMP(3),
    "decision_due_at" TIMESTAMP(3),
    "closure_due_at" TIMESTAMP(3),

    CONSTRAINT "BreachCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring"."Evaluation" (
    "id" TEXT NOT NULL,
    "breach_case_id" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "criteria_id" TEXT NOT NULL,
    "evaluated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring"."Outbox" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "trace_context" JSONB,

    CONSTRAINT "Outbox_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "monitoring"."Evaluation" ADD CONSTRAINT "Evaluation_breach_case_id_fkey" FOREIGN KEY ("breach_case_id") REFERENCES "monitoring"."BreachCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
