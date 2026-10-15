# Architecture

Packed validation and registry releases use prepared modules and declarations
through the same public import names. Components remain consumer compiled;
TypeScript rune modules become `.svelte.js` before dependency prebundling. Local
development exports remain source based. Release archives retain source alongside
prepared output, while the local archive profile does not publish releases.
Both archive profiles prepare browser CSS before packing. Tailwind remains an
internal authoring tool; published styles require no consumer compiler or scan.

Design Core is a shared presentation and controller library. Consumer applications retain domain policy, persistence, transport, routing, and environment adapters. Component ownership and public-layer classification are maintained in the canonical [`component inventory`](component-inventory.md).

Bits UI resolves from the published `^2.19.5` range, including upstream Scroll
Area resize and text-selection teardown fixes. Runtime diagnostics remain fatal
in Storybook browser tests, including dependency-originated diagnostics.

The development catalog and Storybook test host share one dependency-preparation
inventory, including the exact Lucide imports discovered in catalog sources.
Browser acceptance waits for client compilation and pending import requests to
settle through the fail-closed catalog readiness endpoint. Workspace pointer
acceptance uses one worker against that shared development host.

Release preparation uses the published Spec Validator 0.1.4 range and Changesets 3. Optional QMD search remains available when installed by the developer; normal
validation does not install its model/native dependency graph. The supported Node
range follows Changesets 3. Declared renderer and tooling overrides retain patched
workspace graphs, while packed consumers audit their own dependency resolution.

## Public surface coverage

| Surface                  | Public boundary | Requirement |
| ------------------------ | --------------- | ----------- |
| Layer boundaries         | Architecture    | DC-ARCH-002 |
| Controlled state         | Architecture    | DC-ARCH-003 |
| Compatibility            | Architecture    | DC-ARCH-004 |
| Local source ownership   | Architecture    | DC-ARCH-005 |
| External consumption     | Architecture    | DC-ARCH-006 |
| Component classification | Architecture    | DC-ARCH-007 |
| Validation execution     | Architecture    | DC-ARCH-008 |

## DC-ARCH-002 — Layer boundaries

**Requirement.** Production code MUST preserve the Shadcn, Forms, Filter, AI, Diff, Shell, and Workspace ownership boundaries documented by their public package entry points.

### Acceptance details

- Shared Forms compositions own dialog geometry and asynchronous confirmation, while applications provide content snippets.

- A lower-level layer must not acquire consumer routing, persistence, vault, or application-domain policy.
- A cross-layer composition may depend only on public contracts or an explicitly documented internal boundary.

## DC-ARCH-003 — Controlled state

**Requirement.** Reusable stateful components MUST expose controlled values or explicit controllers while leaving persistence and authoritative application state to consumers.

### Acceptance details

- Internal state may own transient presentation metadata such as disclosure, focus, or generated item identities.
- External value replacement must remain a supported operation wherever a controlled API is documented.

## DC-ARCH-004 — Compatibility

**Requirement.** Public additions MUST be additive unless a migration is explicitly specified, compatibility entry points MUST continue to resolve to their owning implementation, engine-specific compatibility behavior MUST preserve the same public component and reference contracts behind an explicit internal strategy marker, and inherited appearance policy MUST cross separately mounted surfaces through owned DOM attributes rather than consumer wrappers.

### Acceptance details

- Direct compatibility exports may delegate to family barrels but must not fork behavior, and source exports plus their declared dependencies must remain type-compatible with strict consumers, including exact optional-property and unchecked-index semantics across composed Shadcn, AI, Filter, Shell, and Forms surfaces.
- Focused public subpaths MAY isolate one reusable family or a Design Core-owned Storybook reference composition, provided consumers do not load unrelated barrel dependencies and reference components do not require story-local CSS.
- Existing AI snippet composition, manual history loading and streaming scroll defaults MUST remain available while virtualization and anchored history opt in through configuration, and a breaking removal or semantic change requires a new or revised canonical requirement.
- Root manifest changes must update the owning architecture and package chapters in the same protected diff.

## DC-ARCH-005 — Local source ownership

**Requirement.** Linked LapisMD packages MUST be fixed in their owning repository and rebuilt before Design Core validates the consumer integration.

### Acceptance details

- Design Core must not vendor or patch a sibling package to conceal an upstream defect.
- Consumer-specific adapters may remain local when they do not redefine the upstream public contract.
- Shared development tooling may use published npm packages and narrow patched dependency resolutions or overrides, but browser validation dependencies must resolve deterministically before a cold suite starts rather than changing the active module graph during execution, and repository workflows must use maintained action runtimes.
- Lifecycle-sensitive Shell and Shadcn browser lanes may serialize their workers when concurrent first loads would race one shared development catalog, and comprehensive Storybook interactions plus heavy Workspace fixture imports may use explicit bounded cold-run budgets.

## DC-ARCH-006 — External consumption

Public archive acceptance audits the installed production graph independently
of local overrides. The recorded KaTeX exception under DC-PKG-009 is limited
to Design Core 0.3.0 and its preparation manifest; subsequent releases cannot
inherit that risk acceptance.

**Requirement.** Independent first-party plugins MUST consume Design Core through its public versioned package boundary without repository source aliases or sibling workspace membership.

### Acceptance details

- Root package installation must not require sibling repositories or private workspace tooling packages.
- The published boundary must omit repository-local caches and catalog-only examples.
- Colocated workspace linking must not change the published dependency range.
- Public metadata must identify `lapismd/design-core` as the canonical source.

## DC-ARCH-008 — Validation execution

**Requirement.** Repository validation MUST execute cacheable work through a bounded Turbo runner with signed remote caching that fails open to normal local execution.

### Acceptance details

- Default concurrency must be half the available processors capped at four, with a validated `TURBO_CONCURRENCY` override.
- CI and non-CI executions must not share cache keys.
- VCS-dependent governance and registry-dependent dependency audits must remain uncached, while post-publication registry checks may use bounded visibility retries for eventual npm propagation.
- Remote cache credentials must come from ignored local environment files or CI secrets and must never be logged.
