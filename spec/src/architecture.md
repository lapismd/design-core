# Architecture

Design Core is a shared presentation and controller library. Consumer applications retain domain policy, persistence, transport, routing, and environment adapters.

## Public surface coverage

| Surface                | Public boundary | Requirement |
| ---------------------- | --------------- | ----------- |
| Layer boundaries       | Architecture    | DC-ARCH-002 |
| Controlled state       | Architecture    | DC-ARCH-003 |
| Compatibility          | Architecture    | DC-ARCH-004 |
| Local source ownership | Architecture    | DC-ARCH-005 |

## DC-ARCH-002 — Layer boundaries

**Requirement.** Production code MUST preserve the Shadcn, Forms, Filter, AI, Shell, and Workspace ownership boundaries documented by their public package entry points.

### Acceptance details

- A lower-level layer must not acquire consumer routing, persistence, vault, or application-domain policy.
- A cross-layer composition may depend only on public contracts or an explicitly documented internal boundary.

## DC-ARCH-003 — Controlled state

**Requirement.** Reusable stateful components MUST expose controlled values or explicit controllers while leaving persistence and authoritative application state to consumers.

### Acceptance details

- Internal state may own transient presentation metadata such as disclosure, focus, or generated item identities.
- External value replacement must remain a supported operation wherever a controlled API is documented.

## DC-ARCH-004 — Compatibility

**Requirement.** Public additions MUST be additive unless a migration is explicitly specified, and compatibility entry points MUST continue to resolve to their owning implementation.

### Acceptance details

- Direct compatibility exports may delegate to family barrels but must not fork behavior.
- A breaking removal or semantic change requires a new or revised canonical requirement.

## DC-ARCH-005 — Local source ownership

**Requirement.** Linked LapisMD packages MUST be fixed in their owning repository and rebuilt before Design Core validates the consumer integration.

### Acceptance details

- Design Core must not vendor or patch a sibling package to conceal an upstream defect.
- Consumer-specific adapters may remain local when they do not redefine the upstream public contract.
