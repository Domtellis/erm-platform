# Observability Baseline

This document defines the standards for distributed tracing and logging across the ERM platform.

## Distributed Tracing (OpenTelemetry)

We use **W3C Trace Context** for HTTP headers and map them to **CloudEvents** extensions for asynchronous eventing.

### HTTP Propagation
All services must propagate the `traceparent` and `tracestate` headers.

### CloudEvents Mapping
When publishing an event, the current trace context must be injected into the CloudEvent as extensions following the OpenTelemetry CloudEvents specification:

- `ext_traceparent`: The W3C `traceparent` (e.g., `00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`)
- `ext_tracestate`: The W3C `tracestate` (optional)

### Correlation IDs
Every trace must also carry a **Business Correlation ID** (`bc_id`) in its attributes (baggage) to allow searching for all traces related to a specific `breach_case_id`.

## Logging Standards

All logs must be structured (JSON) and include:
- `timestamp`
- `level`
- `service_name`
- `trace_id`
- `span_id`
- `tenant_id`
- `message`
