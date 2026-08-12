# Workspace / Framework

Workspace framework contracts coordinate reusable layout and state through explicit controllers, registries, events, and consumer adapters.

## Public surface coverage

| Surface                     | Public boundary                            | Requirement |
| --------------------------- | ------------------------------------------ | ----------- |
| Shared Workspace invariants | Workspace layer                            | DC-WS-001   |
| Workspace core              | `@lapismd/design-core/workspace/core`      | DC-WS-002   |
| Workspace App Shell         | `@lapismd/design-core/workspace/app-shell` | DC-WS-003   |
| Workspace demo              | `@lapismd/design-core/workspace/demo`      | DC-WS-004   |
| Workspace drag              | `@lapismd/design-core/workspace/drag`      | DC-WS-005   |
| Workspace View Host         | `@lapismd/design-core/workspace/view-host` | DC-WS-006   |
| Workspace Guidance          | Documentation surface                      | DC-WS-007   |

## DC-WS-001 — Shared Workspace invariants

**Requirement.** The Shared Workspace invariants family MUST separate framework state and presentation from consumer routing, persistence, file systems, commands, and domain adapters.

### Acceptance details

- The public boundary is Workspace layer.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-002 — Workspace core

**Requirement.** The Workspace core family MUST provide typed controllers, models, events, and registries for reusable workspace state.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/core`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-003 — Workspace App Shell

**Requirement.** The Workspace App Shell family MUST adapt workspace state to the shared structural shell without redefining App Shell primitives.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/app-shell`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-004 — Workspace demo

**Requirement.** The Workspace demo family MUST provide a reusable behaviorally real framework demonstration with replaceable consumer adapters.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/demo`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-005 — Workspace drag

**Requirement.** The Workspace drag family MUST coordinate typed drag state and actions independently of application persistence.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/drag`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-006 — Workspace View Host

**Requirement.** The Workspace View Host family MUST resolve registered views into the active workspace surface with explicit missing and error states.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/view-host`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-007 — Workspace Guidance

**Requirement.** The Workspace Guidance family MUST document framework ownership, controller contracts, consumer adapters, composition, and validation expectations.

### Acceptance details

- The public boundary is Documentation surface.
- Workspace progress records MUST keep completed panel presentation refinements mapped to their owning panel contract and evidence.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
