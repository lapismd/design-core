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
| Workspace navigation        | `@lapismd/design-core/workspace/app-shell` | DC-WS-038   |
| Managed plugin registry     | `@lapismd/design-core/workspace/core`      | DC-WS-040   |

## DC-WS-001 — Shared Workspace invariants

**Requirement.** The Shared Workspace invariants family MUST separate framework state and presentation from consumer routing, persistence, file systems, commands, and domain adapters.

### Acceptance details

- The public boundary is Workspace layer.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-002 — Workspace core

**Requirement.** The Workspace core family MUST provide typed controllers, models, events, and registries for reusable workspace state.

### Acceptance details

- The catalog MUST demonstrate supported states through the public `@lapismd/design-core/workspace/core` boundary without introducing a second runtime contract.
- Application workspace state transitions and consumer-adapter intents MUST remain typed and independent of consumer persistence, including Explorer's three activation intents and a consumer-controlled user-created-tab activation policy.
- Programmatic tab creation MUST render immediately, and implicit leaf opens MUST target the active or first main pane when a sidebar or dock has focus.
- Imperative view registration MUST expose live context chrome before mounting and MUST react when instance-owned chrome becomes available.

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
- Workspace views MUST inherit primary background and foreground tokens resolved by their destination surface.
- The secondary view background MUST contrast with the primary surface: workspace secondary for ordinary and grouped views, and workspace background for direct sidebars.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-007 — Workspace Guidance

**Requirement.** The Workspace Guidance family MUST document framework ownership, controller contracts, consumer adapters, composition, and validation expectations.

### Acceptance details

- The public boundary is Documentation surface.
- Workspace guidance and progress records MUST keep completed panel presentation refinements, including leaf-owned chrome and readable severity filters, mapped to their owning panel contract and evidence.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-038 — Workspace navigation

**Requirement.** The Workspace App Shell MUST present optional consumer-supplied workspace navigation without owning workspace discovery, selection, or persistence policy.

### Acceptance details

- The public contract supplies the current label, recent options, disabled state, descriptions, and selection and management callbacks.
- The desktop sidebar MUST render an accessible menu with current, empty, recent, and management states.
- Without an actionable navigation contract, the workspace label MUST remain non-interactive.

## DC-WS-040 — Managed plugin registry

**Requirement.** The managed plugin registry MUST combine lifecycle sources through source-qualified identities and delegate enablement without owning application policy or persistence.

### Acceptance details

- Duplicate source identities must be rejected and removed sources must unsubscribe from lifecycle notifications.
- Required entries must reject disablement before calling their owning source.
- The built-in shell plugin manager must participate through the same public source contract as consumer managers.
