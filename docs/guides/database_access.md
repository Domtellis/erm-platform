# Database Access Guide

The ERM Platform uses a single PostgreSQL container (`erm-postgres`) hosting multiple logical databases/schemas for each service.

## Connection Details

- **Host**: `localhost`
- **Port**: `5434` (Mapped from container port 5432 via SSH tunnel to OCI)
- **User**: `postgres`
- **Password**: `password`

> **Note:** The canonical database runs on OCI. Open the SSH tunnel before connecting:
> ```powershell
> ssh -i "C:\Users\domte\erm-platform\.ssh\id_rsa_oci" -L 5434:localhost:5434 ubuntu@144.24.254.202 -N
> ```

## Logical Databases

Each microservice has its own isolated database/schema:

| Service | Database Name | Schema | Description |
|---|---|---|---|
| **Monitoring** | `monitoring` | `monitoring` | Breaches, Metrics |
| **Decisioning** | `decisioning` | `decisioning` | Risk Assessments, Decisions, Plans |
| **Audit** | `audit` | `audit` | Audit Events (Immutable Log) |
| **AI Risk** | `ai_risk` | `ai_risk` | S-AIR Standards Registry, AssessmentSuggestions, StandardSnapshots, SyncLog |
| **Keycloak** | `keycloak` | `public` | Identity & Sessions |

### Key Tables in `ai_risk` Schema

| Table | Purpose |
|---|---|
| `PortContextClause` | ILO/IMO Port Code clauses (14 active entries — ILO Port 2018 + ISO 31000:2018) |
| `SyncLog` | Tracks freshness of the standards registry; `status = 'active'` required for unwarned AI assessments |
| `StandardSnapshot` | Immutable record of exactly which clauses were applied to each assessment (temporal audit trail) |
| `AssessmentSuggestion` | AI-generated risk suggestion including `ilo_clause_applied`, `iso_clause_applied`, `unable_to_cite_reason` |

## Access Methods

### 1. Command Line (via SSH tunnel to OCI)
```bash
# Connect to ai_risk schema
psql postgresql://postgres:password@localhost:5434/ai_risk

# Query the Standards Registry
psql -c "SELECT clause_ref, title, metric_tags FROM ai_risk.\"PortContextClause\" ORDER BY clause_ref;"
```

### 2. GUI Client (DBeaver, pgAdmin, TablePlus)
Configure your client with the connection details above.
**Note**: Ensure you specify the correct **Database** (e.g., `ai_risk`) in your connection settings.

### 3. Prisma Studio (Web UI)
Each service has a Prisma schema. You can run Prisma Studio from the service directory to view/edit data.

```bash
# View AI Risk / Standards Registry Data
cd services/erm-ai-risk-service
npx prisma studio
# Opens http://localhost:5555

# View Monitoring Data
cd services/monitoring-and-breaches
npx prisma studio

# View Decisioning Data
cd services/decisioning-and-approvals
npx prisma studio
# Opens http://localhost:5555 (stop previous one first)
```

