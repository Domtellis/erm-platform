# ERM Platform - Local Infrastructure

This directory contains Docker Compose configurations for running the ERM Platform locally.

## Quick Start

### Start Production Stack
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### Start Development Stack (with hot-reload)
```bash
docker-compose up -d --build
```

## Services

### Core Platform
- **PostgreSQL** (5432): Primary database
- **Redpanda** (9092, 8081): Kafka-compatible event streaming
- **Keycloak** (8080): Identity and access management
- **OPA** (8181): Policy engine

### Application Services
- **Monitoring Service** (4010): Breach ingestion and management
- **Decisioning Service** (4011): Risk assessment and approvals
- **Audit Service** (4013): Event logging and reporting
- **Notification Service** (4014): Email and webhook alerts
- **Web Portal** (5180): React frontend

### Observability Stack
- **Prometheus** (9090): Metrics collection and time-series database
- **Grafana** (3000): Real-time dashboard with service health monitoring
- **Jaeger** (16686): Distributed tracing visualization
- **OTel Collector** (4318): Telemetry aggregation
- **Mailpit** (8025): Email testing

## Access Points
- Web Portal: http://localhost:5180
- Grafana Dashboard: http://localhost:3000 (admin/admin)
- Prometheus: http://localhost:9090
- Keycloak Admin: http://localhost:8080 (admin/admin)
- Jaeger UI: http://localhost:16686
- Mailpit UI: http://localhost:8025

## Documentation
- **[Observability Operations Guide](./OBSERVABILITY.md)** - Comprehensive guide for monitoring and troubleshooting

## Configuration Directories
- `postgres/` - Database initialization scripts
- `keycloak/` - IAM realm configuration
- `prometheus/` - Metrics scrape configuration
- `grafana/` - Dashboard provisioning and datasources
