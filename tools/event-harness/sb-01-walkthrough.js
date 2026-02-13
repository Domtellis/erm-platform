const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { publishEvent } = require("./scripts/publish");

const MONITORING_API = "http://localhost:4010";
const DECISIONING_API = "http://localhost:4011";
const APPETITE_API = "http://localhost:4012";

async function runSB01Walkthrough() {
    const correlationId = uuidv4();
    const traceId = uuidv4().replace(/-/g, "");
    const traceParent = `00-${traceId}-00f067aa0ba902b7-01`;

    console.log(`\n🚀 Starting SB-01 Proof-of-Path Walkthrough`);
    console.log(`🆔 Trace ID: ${traceId}`);
    console.log(`🆔 Correlation ID: ${correlationId}\n`);

    // STEP 1: Ingest Manual Breach Submission
    console.log("--- STEP 1: Manual Breach Submission ---");
    try {
        const submission = await axios.post(`${MONITORING_API}/breaches/manual-submission`, {
            title: "Elevated Safety Incident - Site A",
            description: "Pressure sensor threshold exceeded in primary containment.",
            category: "safety",
            bu_id: "BU-NORTH-01"
        }, {
            headers: { "x-correlation-id": correlationId, "traceparent": traceParent }
        });
        console.log("✅ Submission Received. Breach Case Created:", submission.data.breach_case_id);

        // STEP 2: Simulate Breach Detected Event (from Monitoring)
        console.log("\n--- STEP 2: Emitting Domain Event: breach-detected ---");
        await publishEvent("erm.monitoring.breach-detected.v1", {
            breach_case_id: submission.data.breach_case_id || "BC-2026-001",
            signal_id: "SIG-999",
            source: "ManualEntry",
            category: "safety",
            severity: "high",
            detected_at: new Date().toISOString()
        }, { traceParent, correlationId });
        console.log("✅ Event Published to Redpanda.");

        // STEP 3: Request Appetite Context
        console.log("\n--- STEP 3: Fetching Appetite Thresholds ---");
        const appetite = await axios.get(`${APPETITE_API}/appetites/current?category=safety`, {
            headers: { "x-correlation-id": correlationId, "traceparent": traceParent }
        });
        console.log("✅ Appetite Data Retrieved. Version:", appetite.data.version);

        // STEP 4: Submit Decision
        console.log("\n--- STEP 4: Submitting Response Decision (Mitigate) ---");
        const decision = await axios.post(`${DECISIONING_API}/decisions`, {
            breach_case_id: submission.data.breach_case_id || "BC-2026-001",
            decision_type: "mitigate",
            rationale: "Automated shutdown initiated. Evacuation in progress.",
            submitted_by: "USER-99"
        }, {
            headers: { "x-correlation-id": correlationId, "traceparent": traceParent }
        });
        console.log("✅ Decision Recorded. Decision ID:", decision.data.decision_id);

        // STEP 5: Perform OPA Gated Approval
        console.log("\n--- STEP 5: Performing Governance-Gated Approval ---");
        const approval = await axios.post(`${DECISIONING_API}/decisions/${decision.data.decision_id}/approve`, {
            approver_user_id: "APPROVER-01",
            approver_role: "bu_risk_owner",
            comments: "Verified safety protocols followed."
        }, {
            headers: { "x-correlation-id": correlationId, "traceparent": traceParent }
        });
        console.log("✅ Approval Processed. SoD Check Passed:", approval.data.sod_check_passed);

        // STEP 6: Emit Final Approved Event
        console.log("\n--- STEP 6: Emitting Domain Event: decision-approved ---");
        await publishEvent("erm.governance.decision-approved.v1", {
            breach_case_id: submission.data.breach_case_id || "BC-2026-001",
            decision_id: decision.data.decision_id,
            approver_user_id: "APPROVER-01",
            approver_role: "bu_risk_owner",
            approved_at: new Date().toISOString(),
            sod_check_passed: true
        }, { traceParent, correlationId });
        console.log("✅ Final Audit Event Published.");

        console.log(`\n🎉 SB-01 Proof-of-Path Completed Successfully!`);
        console.log(`🔍 Check Jaeger for Trace: ${traceId}`);

    } catch (error) {
        console.error("\n❌ Walkthrough Failed:", error.message);
        if (error.response) console.error("Error Details:", error.response.data);
    }
}

runSB01Walkthrough();
