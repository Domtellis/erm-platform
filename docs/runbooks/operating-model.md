# ERM Operating Model: Service-Ops SOP

## 1. Overview
This SOP defines the "Service-Ops" model for the ERM Platform. It shifts away from manual communication (Slack/Teams) toward a centralized **Notification Service**.

## 2. Notification Priority Matrix

| Severity | Channel | Response SLA |
| :--- | :--- | :--- |
| **P0 - Critical** | Email + Jira + Phone | < 15 Min |
| **P1 - High** | Email + Jira | < 1 Hour |
| **P2 - Medium** | Jira Ticket | < 4 Hours |

## 3. Incident Management
All platform incidents must be logged in the **Incident Management Module** to ensure cross-service traceability.

## 4. AI Oversight
The **AI Oversight Lead** conducts weekly calibration reviews. All disagreements must be documented as "Feedback" in the AI Risk Service.

## 5. Standards Registry — Runbook

### 5.1 Detecting a Stale Standards Registry

**Trigger:** Kafka event `erm.standards.out-of-sync.v1` received, or `/health/standards` endpoint returns `status: "stale"`.

**Symptoms:**
- AI assessments include `standards_warning: true` in their payload
- `SyncLog` table shows `status = 'stale'` with a `last_checked_at` older than 7 days

**Resolution Steps:**
1. Access the OCI DB via SSH tunnel:
   ```powershell
   ssh -i "C:\Users\domte\erm-platform\.ssh\id_rsa_oci" -L 5434:localhost:5434 ubuntu@144.24.254.202 -N
   ```
2. Check the current sync status:
   ```sql
   SELECT * FROM ai_risk."SyncLog" ORDER BY created_at DESC LIMIT 5;
   ```
3. If the ILO publication has genuinely changed, the compliance team must review and update `ilo-port-2018-clauses.json`, then re-run:
   ```bash
   npx ts-node src/standards/seeds/seed-ilo-clauses.ts
   ```
4. If it's a false positive (no real change), update the SyncLog manually:
   ```sql
   UPDATE ai_risk."SyncLog" SET status = 'active', last_checked_at = NOW() WHERE id = '<id>';
   ```
5. Verify the health endpoint returns `status: "healthy"` before closing the incident.

### 5.2 Standards Registry Empty

**Trigger:** `erm.risk.standards-unavailable.v1` event emitted. AI assessments are proceeding without ILO clause grounding.

**Resolution:** Re-run the seed script against OCI as per the [Standards Ingestion Guide](../guides/standards-ingestion-guide.md).


**Impact:** While the registry is empty, AI assessments continue (graceful degradation) but will carry `standards_warning: true`. All such assessments **require mandatory HITL review** before any action is taken.

