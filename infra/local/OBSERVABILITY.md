# Observability Operations Guide

## Overview
The ERM Platform includes a comprehensive observability stack for monitoring system health, performance, and distributed tracing.

## Components

### Prometheus (Metrics)
- **URL**: http://localhost:9090
- **Purpose**: Time-series metrics database
- **Scrape Configuration**: `/infra/local/prometheus/prometheus.yml`
- **Scrape Interval**: 5 seconds
- **Retention**: Default (15 days)

### Grafana (Dashboards)
- **URL**: http://localhost:3000
- **Default Credentials**: `admin` / `admin`
- **Provisioning**: Auto-provisioned via `/infra/local/grafana/provisioning`
- **Dashboards**: 
  - "ERM System Overview": Infrastructure & API health.
  - "AI Risk Assessment Performance": AI TRiSM & FinOps telemetry.

### Jaeger (Distributed Tracing)
- **URL**: http://localhost:16686
- **Purpose**: Trace visualization and service dependency mapping
- **Backend**: In-memory storage (development mode)

### OpenTelemetry Collector
- **Endpoint**: http://erm-otel-collector:4318 (OTLP/HTTP)
- **Purpose**: Telemetry aggregation and forwarding
- **Exports To**: Prometheus (metrics), Jaeger (traces)

## Dashboard Features

### Service Health Panels
Application services display real-time status indicators:
- **🟢 GREEN**: Service is running and exporting metrics
- **🔴 RED**: Service is down or not exporting metrics (no data for 5+ minutes)

**Application Services Monitored:**
- Monitoring Service (Port 4010)
- Decisioning Service (Port 4011)
- Audit & Reporting Service (Port 4013)
- Notification Service (Port 4014)
- Web Portal (Port 5180)
- Observability Collector (Port 8889)

**Platform Services:**
- PostgreSQL, Kafka, Keycloak, OPA, Prometheus, Grafana, Jaeger, Mailpit
- Status: 🟡 YELLOW "NO METRICS" (expected - these don't export Prometheus metrics)

### AI TRiSM Monitoring (2026 Standards)
The `ai-risk-service` provides deep visibility into the AI lifecycle via a 3-Tier framework:

**Tier 1: High-Level Health**
- **Total Assessments**: Volume of AI risk suggestions generated.
- **AI Cost Burn**: Estimated USD spend based on token consumption (Input vs Output).
- **Safety Blocks**: Count of responses blocked by provider safety filters.

**Tier 2: Security & Quality**
- **Validation Rate**: Groundedness and semantic quality scores.
- **Human Agreement**: Rate at which AI suggestions are accepted vs modified.
- **Policy Violations**: Categorization of safety hits (Harassment, Hatespeech, etc.).

**Tier 3: Operational Telemetry**
- **Gemini Latency**: p95/p50 response times for the LLM provider.
- **Token Throughput**: Input vs Output tokens per second.
- **Provider Reliability**: Rate of 429 (Quota) and 5xx (API) errors.

### Traffic & Performance Metrics
- **Request Rate**: HTTP requests per minute (grouped by service)
- **Average Latency**: Response time in milliseconds
- **Error Rate**: 5xx errors per minute

## Metrics Architecture

### Metric Flow
```
Application Services → OTel Collector → Prometheus → Grafana
```

### Key Metrics
- `http_server_duration_milliseconds_sum` - Server request duration sum

### AI TRiSM Metrics
- `ai_assessment_total` - Total assessments generated (counter).
- `ai_usage_tokens_total` - Tokens consumed (prompt vs completion).
- `ai_usage_cost_total` - Estimated USD cost (calculated in GeminiClient).
- `ai_safety_block_count_total` - Safety filter hits by category.
- `ai_gemini_call_duration_milliseconds` - Latency histogram.

### Label Handling
**Important**: When services push metrics to OTel Collector, the original `job` label is renamed to `exported_job` when Prometheus scrapes. Dashboard queries use:
```promql
count(http_client_duration_milliseconds_bucket{exported_job="erm-monitoring-service"}) > 0
```

## Prometheus Caching Behavior
Prometheus caches metrics for approximately **5 minutes** after a service stops exporting. This means:
- Dashboard shows 🟢 GREEN during cache period (prevents false alarms from brief restarts)
- Dashboard shows 🔴 RED after ~5 minutes of actual downtime
- Dashboard returns to 🟢 GREEN within 10-30 seconds after service restart

## Common Operations

### View Service Metrics in Prometheus
1. Navigate to http://localhost:9090
2. Query examples:
   ```promql
   # Check if monitoring service is exporting metrics
   count(http_client_duration_milliseconds_bucket{exported_job="erm-monitoring-service"}) > 0
   
   # Request rate for all services
   sum(rate(http_server_duration_milliseconds_count[1m])) by (exported_job)
   
   # Average latency by service
   sum(rate(http_server_duration_milliseconds_sum[1m])) by (exported_job) / 
   sum(rate(http_server_duration_milliseconds_count[1m])) by (exported_job)
   ```

### Refresh Grafana Dashboard
If dashboard isn't showing latest changes:
1. Check for duplicate dashboard files in `/infra/local/grafana/dashboards/`
2. Restart Grafana: `docker restart erm-grafana`
3. Wait 10-15 seconds for provisioning to complete
4. Hard refresh browser (Ctrl+Shift+R)

### View Distributed Traces in Jaeger
1. Navigate to http://localhost:16686
2. Select service from dropdown (e.g., "erm-monitoring-service")
3. Click "Find Traces" to see recent request traces
4. Click on a trace to view the full span waterfall

### Check OTel Collector Health
```bash
# View collector metrics endpoint
curl http://localhost:8889/metrics

# Check collector logs
docker logs erm-otel-collector --tail 50
```

## Troubleshooting

### Dashboard Shows RED but Service is Running
1. **Wait 30 seconds** - Prometheus may be scraping
2. **Check Prometheus targets**: http://localhost:9090/targets
3. **Verify OTel Collector is running**: `docker ps | grep otel-collector`
4. **Check service instrumentation**:
   ```bash
   # Verify service is exporting metrics to collector
   docker logs erm-monitoring-service | grep -i "metric\|otel"
   ```

### Dashboard Not Loading
1. **Check Grafana logs**: `docker logs erm-grafana --tail 50`
2. **Look for provisioning errors** (duplicate UIDs, permission issues)
3. **Reset Grafana database** (deletes custom dashboards):
   ```bash
   docker exec erm-grafana rm -f /var/lib/grafana/grafana.db
   docker restart erm-grafana
   ```

### No Metrics Appearing
1. **Verify services are instrumented** - Check `instrumentation.ts` in each service
2. **Verify OTel Collector endpoint** - Should be `http://erm-otel-collector:4318`
3. **Check Prometheus scrape config** - Should scrape `erm-otel-collector:8889`
4. **Verify network** - All containers should be on `local_default` network

## Verification Commands

```bash
# Check all observability services are running
docker ps --filter name=erm-prometheus --filter name=erm-grafana --filter name=erm-otel-collector --filter name=erm-jaeger

# Test Prometheus query via API
docker run --rm --network local_default curlimages/curl -s \
  "http://erm-prometheus:9090/api/v1/query?query=up" | jq

# Check Grafana dashboard list
docker run --rm --network local_default curlimages/curl -s \
  "http://erm-grafana:3000/api/search" -u admin:admin | jq

# View OTel Collector metrics
curl http://localhost:8889/metrics | grep http_
```

## Configuration Files
- **Prometheus**: `/infra/local/prometheus/prometheus.yml`
- **Grafana Datasource**: `/infra/local/grafana/provisioning/datasources/datasource.yml`
- **Grafana Dashboard Provisioning**: `/infra/local/grafana/provisioning/dashboards/dashboards.yml`
- **Dashboard JSON**: `/infra/local/grafana/dashboards/system_dashboard.json`
- **OTel Collector**: `/infra/local/otel-collector/config.yaml`

## Production Considerations

### Metrics Retention
- Current: 15 days (Prometheus default)
- Recommended: Configure retention based on compliance requirements
- Configure via `--storage.tsdb.retention.time` flag in `docker-compose.yml`

### Grafana Persistence
- Current: Using Docker volumes for dashboard persistence
- Recommended: Backup dashboard JSON files to version control
- Export via: Grafana UI → Dashboard Settings → JSON Model

### Alerting
- Not yet implemented
- Future: Configure Prometheus Alertmanager for critical service failures
- Future: Integrate with notification-service for incident routing
