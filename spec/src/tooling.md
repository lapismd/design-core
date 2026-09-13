# Tooling

Repository tools keep source generation, discovery, documentation, validation, Changesets, and package-pack evidence reproducible for humans and agents. The catalog CLI lists Diff families, including File Change Stats and Merge Editor, beside shadcn, forms, filter, and AI. Agent tooling guidance keeps external LapisMD repositories outside the workspace and resolves published dependencies through npm semver ranges while preserving portable manifests.

## Public surface coverage

| Surface               | Public boundary | Requirement |
| --------------------- | --------------- | ----------- |
| UI catalog CLI        | Tooling         | DC-TOOL-001 |
| Component generator   | Tooling         | DC-TOOL-002 |
| Validation commands   | Tooling         | DC-TOOL-003 |
| Offline documentation | Tooling         | DC-TOOL-004 |
| Turbo orchestration   | Tooling         | DC-TOOL-005 |

## DC-TOOL-001 — UI catalog CLI

**Requirement.** The UI catalog CLI family MUST list and inspect guides and component families in human-readable and JSON forms.

The AI catalog derives stable public chat components, including shared tool-call detail, from their colocated stories and public subpath exports.

### Acceptance details

- Machine-readable output must be stable enough for repository automation, and validation must include strict public Shell, Search Filter Bar, and composed source-consumer type-checks so source-export compatibility cannot regress unnoticed.
- Tooling failures must report an actionable source path or command.

## DC-TOOL-002 — Component generator

**Requirement.** The Component generator family MUST add, inspect, refresh, and diagnose owned component sources through guarded repository workflows.

### Acceptance details

- Machine-readable output must be stable enough for repository automation, and type validation must exercise focused and composed public source exports under the strict compiler options used by first-party consumers.
- Tooling failures must report an actionable source path or command.
- Generator path allowlists must point to the canonical component inventory rather than a duplicate root document.
- Multipart family CSS must be emitted from an always-instantiated root or content part rather than an optional sibling component, including styles extracted from unannotated nested elements.

## DC-TOOL-003 — Validation commands

**Requirement.** The Validation commands family MUST provide focused formatting, type, unit, Storybook, source-style, browser, build, and visual-comparison commands, including narrowly filtered engine projects when a compatibility boundary requires real browser acceptance.

### Acceptance details

- Machine-readable output must be stable enough for repository automation.
- Tooling failures must report an actionable source path or command.
- Specification commands must retain separate validation, build, spec-first, index, search, and serve entry points through the configured shared CLI.
- Release-safe aggregate gates must use bootstrap-safe validation, cold Storybook browser tests must prebundle editor parser dependencies so Vite cannot invalidate active suites with a dependency-optimization reload, lifecycle-sensitive Storybook browser checks must run serially against one initialized catalog, comprehensive Storybook interactions and heavy Workspace fixture imports must have bounded cold-run execution windows, and packaging must fail if a tarball includes local cache artifacts such as source-tree `Library/Caches`, `__pycache__`, or Python bytecode files.

## DC-TOOL-004 — Offline documentation

**Requirement.** The offline documentation tooling MUST expose guide and component discovery through repository-local CLI commands without depending on a private Docs MCP workspace package.

### Acceptance details

- Machine-readable output must be stable enough for repository automation.
- Tooling failures must report an actionable source path or command.
- Guide and component discovery must point readers back to canonical source paths instead of becoming a second authority.
- Removed Docs MCP commands must not appear in root package scripts or Storybook host configuration.

## DC-TOOL-005 — Turbo orchestration

**Requirement.** Turbo orchestration MUST expose deterministic local and CI task commands, bounded concurrency, and auditable cache results.

### Acceptance details

- The local nonvisual aggregate must execute the same functional lanes that CI fans out, running governance, quality, and unit work concurrently while serializing resource-heavy Storybook and browser suites.
- Static Storybook output must be restored from cache when its inputs are unchanged.
- Cache reporting must distinguish remote hits, local hits, and executed tasks.
- Focused tests must cover default concurrency, overrides, and cache-summary classification.
