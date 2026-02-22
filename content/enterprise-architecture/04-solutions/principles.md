# Architecture Principles

These principles guide technical decisions and implementation across the ERM platform.

## 1. Contract-First Integration
All inter-service and external integrations must be defined by formal contracts (OpenAPI, AsyncAPI, JSON Schema) before implementation begins.

## 2. Single System of Record (SoR)
Each entity (e.g., BreachCase, AppetiteMetric) must have exactly one owning service/context responsible for its state changes. Other contexts consume this data via events or read-only APIs.

## 3. Event-Driven State Changes
Use events to broadcast significant domain state transitions. Synchronous (REST/gRPC) calls should be reserved for immediate user-facing reads or where strong consistency is strictly required.

## 4. No Shared Databases
Bounded contexts must not share database schemas or tables. Data sharing occurs exclusively via defined interfaces (Events/APIs) to prevent tight coupling.

## 5. Audit by Default
Every control action (creation, update, approval, deletion) must emit a corresponding audit event to an immutable audit store.

## 6. Security as Code
Access control policies (RBAC/ABAC) and Separation of Duties (SoD) rules should be defined as version-controlled artifacts and enforced by the platform middleware.

## 7. Human-Centric Intelligence
AI models (Gemini 2.0) are used to augment and accelerate risk professionals, not replace them. Every automated suggestion must have a clear path to human override, and all overrides must be captured for system calibration and auditability.
