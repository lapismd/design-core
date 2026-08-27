# Tooling

Repository tools keep source generation, discovery, documentation, and validation reproducible for humans and agents. The catalog CLI lists Diff families, including File Change Stats and Merge Editor, beside shadcn, forms, filter, and AI. Agent tooling guidance keeps external LapisMD repositories outside the workspace and resolves published dependencies through npm semver ranges while preserving portable manifests.

## Public surface coverage

| Surface               | Public boundary | Requirement |
| --------------------- | --------------- | ----------- |
| UI catalog CLI        | Tooling         | DC-TOOL-001 |
| Component generator   | Tooling         | DC-TOOL-002 |
| Validation commands   | Tooling         | DC-TOOL-003 |
| Offline documentation | Tooling         | DC-TOOL-004 |

## DC-TOOL-001 — UI catalog CLI

**Requirement.** The UI catalog CLI family MUST list and inspect guides and component families in human-readable and JSON forms.

### Acceptance details

- Machine-readable output must be stable enough for repository automation.
- Tooling failures must report an actionable source path or command.

## DC-TOOL-002 — Component generator

**Requirement.** The Component generator family MUST add, inspect, refresh, and diagnose owned component sources through guarded repository workflows.

### Acceptance details

- Machine-readable output must be stable enough for repository automation.
- Tooling failures must report an actionable source path or command.
- Generator path allowlists must point to the canonical component inventory rather than a duplicate root document.

## DC-TOOL-003 — Validation commands

**Requirement.** The Validation commands family MUST provide focused formatting, type, unit, Storybook, source-style, browser, build, and visual-comparison commands, including narrowly filtered engine projects when a compatibility boundary requires real browser acceptance.

### Acceptance details

- Machine-readable output must be stable enough for repository automation.
- Tooling failures must report an actionable source path or command.
- Specification commands must retain separate validation, build, spec-first, index, search, and serve entry points through the configured shared CLI.
- Release-safe aggregate gates must use bootstrap-safe validation and packaging must fail if a tarball includes local cache artifacts such as source-tree `Library/Caches`, `__pycache__`, or Python bytecode files.

## DC-TOOL-004 — Offline documentation

**Requirement.** The offline documentation tooling MUST expose guide and component discovery through repository-local CLI commands without depending on a private Docs MCP workspace package.

### Acceptance details

- Machine-readable output must be stable enough for repository automation.
- Tooling failures must report an actionable source path or command.
- Guide and component discovery must point readers back to canonical source paths instead of becoming a second authority.
- Removed Docs MCP commands must not appear in root package scripts or Storybook host configuration.
