# ADR 0001: Domain-Driven Design (DDD) Bounded Contexts

## Status
Accepted

## Context
The ERM platform is a complex system covering multiple domains: breach response, risk management, control automation, and compliance reporting. To avoid a "big ball of mud" and ensure scalability, we need to define clear boundaries for our software components and data models.

## Decision
We adopted Domain-Driven Design (DDD) to partition the ERM platform into the following **Bounded Contexts**:

### 1. Breach Management (Lighthouse SB-01)
*   **Core Entities**: `BreachCase`, `TriageRecord`, `Escalation`
*   **Responsibility**: Managing the full lifecycle of a detected breach from intake to closure.
*   **Language**: Focuses on "Cases," "Severities," and "SLAs."

### 2. Risk Appetite & Evaluation
*   **Core Entities**: `AppetiteStatement`, `Threshold`, `MeasuredValue`, `Evaluation`
*   **Responsibility**: Defining risk tolerances and evaluating events/metrics against these tolerances.
*   **Interaction**: Provides evaluation results to Breach Management to trigger specific workflows.

### 3. Governance & Approvals
*   **Core Entities**: `Decision`, `Approval`, `DelegatedAuthority`
*   **Responsibility**: Managing formal decisions, approval chains, and ensuring Segregation of Duties (SoD).
*   **Language**: Focuses on "Authorities," "Sign-offs," and "Delegation."

### 4. Corrective Actions (CAPA)
*   **Core Entities**: `ActionItem`, `EvidenceRequirement`, `CompletionProof`
*   **Responsibility**: Tracking mitigations and ensuring evidence is captured before case closure.

### 5. Audit & Observability
*   **Core Entities**: `AuditEvent`, `AuditPack`, `TraceabilityGraph`
*   **Responsibility**: Capturing an immutable record of all changes and generating reports for regulators/auditors.

## Consequences

### Positive
*   **Decoupled Development**: Teams can work on different contexts with minimal side effects.
*   **Clear Ownership**: Data and business logic have a single home.
*   **Scalability**: Individual contexts can be refactored or swapped (e.g., moving from a monolith to microservices) more easily.

### Negative
*   **Complexity**: Requires careful management of "Context Mapping" (how domains talk to each other).
*   **Duplication**: Some data (e.g., User IDs) may appear in multiple contexts, requiring eventual consistency strategies.

## Context Mapping
*   **Events**: We will primarily use Domain Events to notify other contexts of state changes (e.g., `BreachEvaluated` triggers `EscalationRequired`).
*   **Shared Kernel**: A minimal set of core types (e.g., `Persona`, `BU_ID`) will be shared across all contexts.
