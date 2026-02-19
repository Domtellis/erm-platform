# Database Access Guide

The ERM Platform uses a single PostgreSQL container (`erm-postgres`) hosting multiple logical databases/schemas for each service.

## Connection Details

- **Host**: `localhost`
- **Port**: `5434` (Mapped from container port 5432)
- **User**: `postgres`
- **Password**: `password`

## Logical Databases

Each microservice has its own isolated database/schema:

| Service | Database Name | Schema | Description |
|---|---|---|---|
| **Monitoring** | `monitoring` | `monitoring` | Breaches, Metrics |
| **Decisioning** | `decisioning` | `decisioning` | Risk Assessments, Decisions, Plans |
| **Audit** | `audit` | `audit` | Audit Events (Immutable Log) |
| **Keycloak** | `keycloak` | `public` | Identity & Sessions |

## Access Methods

### 1. Command Line (Docker)
You can access the database directly inside the container using `psql`.

```bash
# Connect to Default (postgres) DB
docker exec -it erm-postgres psql -U postgres

# Connect to Specific DB (e.g., Decisioning)
docker exec -it erm-postgres psql -U postgres -d decisioning
```

### 2. GUI Client (DBeaver, pgAdmin, TablePlus)
Configure your client with the connection details above.
**Note**: Ensure you specify the correct **Database** (e.g., `decisioning`) in your connection settings, or you might only see the default `postgres` DB.

### 3. Prisma Studio (Web UI)
Each service has a Prisma schema. You can run Prisma Studio from the service directory to view/edit data.

```bash
# View Monitoring Data
cd services/monitoring-and-breaches
npx prisma studio
# Opens http://localhost:5555

# View Decisioning Data
cd services/decisioning-and-approvals
npx prisma studio
# Opens http://localhost:5555 (stop previous one first)
```
