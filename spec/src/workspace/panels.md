# Workspace / Panels

Workspace panels provide generic domain-neutral views driven by consumer data and actions.

## Public surface coverage

| Surface        | Public boundary                           | Requirement |
| -------------- | ----------------------------------------- | ----------- |
| Explorer Panel | `@lapismd/design-core/workspace/explorer` | DC-WS-033   |
| Problems Panel | `@lapismd/design-core/workspace/problems` | DC-WS-034   |

## DC-WS-033 — Explorer Panel

**Requirement.** The Explorer Panel family MUST compose controlled hierarchical resources, selection, actions, and empty states through generic workspace contracts.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/explorer`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-034 — Problems Panel

**Requirement.** The Problems Panel family MUST present grouped and tabular diagnostics with severity, location, selection, filtering, and consumer-owned navigation actions.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/problems`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
