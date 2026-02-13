# Local Runtime Foundation

This directory contains the infrastructure required to run the ERM platform's "Walking Skeleton" locally.

## Components
- **Redpanda**: Kafka-compatible event bus for asynchronous communication.
- **PostgreSQL**: Central database used with isolated schemas per bounded context.
- **Jaeger**: Distributed tracing UI.
- **OTel Collector**: OpenTelemetry ingestion point for traces and logs.

## Prerequisites
- Docker & Docker Compose installed.

## Getting Started
1. Start the platform infrastructure:
   ```bash
   docker compose up -d
   ```
2. Verify services are healthy:
   ```bash
   docker compose ps
   ```
3. View traces in Jaeger:
   Navigate to [http://localhost:16686](http://localhost:16686)
