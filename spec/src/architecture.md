# Architecture

Design Core is a shared presentation and controller library. Consumer applications retain domain policy, persistence, transport, routing, and environment adapters. Component ownership and public-layer classification are maintained in the canonical [`component inventory`](component-inventory.md).

## Public surface coverage

| Surface                  | Public boundary | Requirement |
| ------------------------ | --------------- | ----------- |
| Layer boundaries         | Architecture    | DC-ARCH-002 |
| Controlled state         | Architecture    | DC-ARCH-003 |
| Compatibility            | Architecture    | DC-ARCH-004 |
| Local source ownership   | Architecture    | DC-ARCH-005 |
| External consumption     | Architecture    | DC-ARCH-006 |
| Component classification | Architecture    | DC-ARCH-007 |

## DC-ARCH-002 — Layer boundaries

**Requirement.** Production code MUST preserve the Shadcn, Forms, Filter, AI, Diff, Shell, and Workspace ownership boundaries documented by their public package entry points.

### Acceptance details

- A lower-level layer must not acquire consumer routing, persistence, vault, or application-domain policy.
- A cross-layer composition may depend only on public contracts or an explicitly documented internal boundary.

## DC-ARCH-003 — Controlled state

**Requirement.** Reusable stateful components MUST expose controlled values or explicit controllers while leaving persistence and authoritative application state to consumers.

### Acceptance details

- Internal state may own transient presentation metadata such as disclosure, focus, or generated item identities.
- External value replacement must remain a supported operation wherever a controlled API is documented.

## DC-ARCH-004 — Compatibility

**Requirement.** Public additions MUST be additive unless a migration is explicitly specified, compatibility entry points MUST continue to resolve to their owning implementation, and engine-specific compatibility behavior MUST preserve the same public component and reference contracts behind an explicit internal strategy marker.

### Acceptance details

- Direct compatibility exports may delegate to family barrels but must not fork behavior.
- Focused public subpaths MAY isolate one reusable family when consumers should not load unrelated barrel dependencies.
- A breaking removal or semantic change requires a new or revised canonical requirement.
- Root manifest changes must update the owning architecture and package chapters in the same protected diff.

## DC-ARCH-005 — Local source ownership

**Requirement.** Linked LapisMD packages MUST be fixed in their owning repository and rebuilt before Design Core validates the consumer integration.

### Acceptance details

- Design Core must not vendor or patch a sibling package to conceal an upstream defect.
- Consumer-specific adapters may remain local when they do not redefine the upstream public contract.
- Shared development tooling may be linked from its owning sibling while Design Core retains its own validation policy and diagnostic identifiers.

## DC-ARCH-006 — External consumption

**Requirement.** Independent first-party plugins MUST consume Design Core through its public versioned package boundary without repository source aliases.

### Acceptance details

- The package manifest must remain registry-installable when sibling repositories are absent.
- The published boundary must omit repository-local caches and catalog-only examples so external installs reproduce only public runtime source.
- Colocated workspace linking may select a matching local version without changing the published dependency range.
- Consumers remain responsible for application plugin lifecycle and policy.
