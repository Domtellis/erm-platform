

# What goes in core/catalogues?

## Artifacts that don't fit neatly into one domain or are referenced by everyone:

- risk-taxonomy.yaml (Used by Business, Product, and Governance)
- control-library.yaml (Used by Governance and Product)
- glossary.yaml


## The Decision: Centralized vs. Federated    (Theory) 

- Core Catalogues: Shared Data used across domains (e.g., Risk Taxonomy, Org Structure, Application List).
- Domain Catalogues: Data specific to a domain (e.g., Value Streams, PRDs, Journeys).

## Best Practice: Use Federated (Domain-Driven).

- Keep highly specific lists (like PRDs) inside their Domain (05-product).
- Keep shared lists (like Risk Types) inside Core (core/catalogues).