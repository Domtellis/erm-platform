# Reliability Patterns

This document details the patterns used to ensure the high availability and resilience of the ERM platform.

## 1. Retry Strategy
- **Standard**: Exponential backoff with jitter should be used for all inter-service communication.
- **Maximum Retries**: 5 attempts.
- **Circuit Breaker**: Services must implement circuit breakers to prevent cascading failures when a downstream dependent is healthy.

## 2. Dead Letter Queues (DLQ)
- Every event consumer must have an associated DLQ.
- Events that fail processing after maximum retries are automatically moved to the DLQ.
- **Replayability**: All DLQ items must be replayable via a standardized operational Tool/API.

## 3. Backpressure handling
- Consumers should use pull-based ingestion (e.g., Kafka consumer groups) to naturally handle spikes without overwhelming the service.

## 4. Tenant Gating
- Performance degradation in one tenant (e.g., massive event bursts) must not impact the processing of events for other tenants. Rate limiting should be applied at the tenant/BU level.
