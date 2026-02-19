# [Service Name] Operations Runbook

**Service:** [Service Name]  
**Owner:** [Team/Person]  
**Last Updated:** [Date]

---

## Service Overview

**Purpose:** [What this service does]  
**Dependencies:** [Other services, databases, external APIs]  
**SLA:** [Uptime target, response time]

---

## Health Checks

### Quick Health Check
```bash
# Check service status
docker ps | grep [service-name]

# Check health endpoint
curl http://localhost:[port]/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "dependencies": {
    "database": "ok",
    "api": "ok"
  }
}
```

### Detailed Diagnostics
```bash
# View logs
docker logs [service-name] --tail 100

# Check metrics
curl http://localhost:[port]/metrics
```

---

## Monitoring & Alerts

**Grafana Dashboard:** [Link or name]  
**Alert Channels:** [Slack, PagerDuty, Email]

### Key Metrics
- `[metric_name]`: [Description, normal range]
- `[metric_name]`: [Description, normal range]

### Critical Alerts
| Alert | Trigger | Severity | Action |
|-------|---------|----------|--------|
| Service Down | uptime == 0 for 5m | Critical | Immediate restart |
| High Latency | p95 > [threshold] | Warning | Investigate load |

---

## Common Issues

### Issue 1: [Problem Description]

**Symptoms:**
- [Observable behavior 1]
- [Observable behavior 2]

**Diagnosis:**
```bash
# Commands to diagnose
[command 1]
[command 2]
```

**Resolution:**
1. Step 1
2. Step 2
3. Step 3

**Prevention:**
- How to avoid this in the future

---

### Issue 2: [Problem Description]

[Repeat structure above]

---

## Incident Response

### Severity Levels

| Severity | Definition | Response Time | Example |
|----------|------------|---------------|---------|
| **Critical** | Complete outage | Immediate | Service down |
| **High** | Major degradation | <30 min | 50% error rate |
| **Medium** | Minor degradation | <2 hours | Slow responses |
| **Low** | No user impact | Next business day | Warning logs |

### Escalation Path

1. **On-call Engineer** → Investigate and attempt resolution
2. **Team Lead** → If unresolved after 30 minutes
3. **CTO/VP Engineering** → If critical and unresolved after 1 hour

---

## Routine Operations

### Deployment
```bash
# Standard deployment process
[deployment commands]
```

### Rollback
```bash
# Emergency rollback procedure
[rollback commands]
```

### Configuration Changes
[How to safely update configuration]

---

## Emergency Procedures

### Complete Outage
1. Check if infrastructure is up (Docker, database)
2. Review recent deployments/changes
3. Check external dependencies
4. Restart service
5. If still down, rollback to last known good version

### Data Corruption
1. Stop writes immediately
2. Assess scope of corruption
3. Restore from backup (see backup section)
4. Notify users if needed

---

## Backups & Recovery

**Backup Schedule:** [Frequency]  
**Retention:** [How long]  
**Location:** [Where backups are stored]

### Restore Procedure
```bash
# Commands to restore from backup
[restore commands]
```

---

## Related Documentation

- [ADR: Architecture decisions](../adrs/)
- [System Architecture](../content/enterprise-architecture/04-solutions/reference-architecture.md)
- [Deployment Guide](../infra/local/README.md)
