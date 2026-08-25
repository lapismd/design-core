# Tooling

Repository tools keep source generation, discovery, documentation, and validation reproducible for humans and agents. The catalog CLI lists Diff families, including File Change Stats and Merge Editor, beside shadcn, forms, filter, and AI. Agent tooling guidance keeps colocated sibling repositories outside the workspace and resolves them through explicit local links while preserving portable published manifests.

## Public surface coverage

| Surface                   | Public boundary | Requirement |
| ------------------------- | --------------- | ----------- |
| UI catalog CLI            | Tooling         | DC-TOOL-001 |
| Component generator       | Tooling         | DC-TOOL-002 |
| Validation commands       | Tooling         | DC-TOOL-003 |
| Docs MCP and llms catalog | Tooling         | DC-TOOL-004 |

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

- Machine-readable output must be stable enough for repository automation, and compatibility browser projects must exercise every engine that owns a distinct runtime strategy.
- Tooling failures must report an actionable source path or command.
- Specification commands must retain separate validation, build, spec-first, index, search, and serve entry points through the configured shared CLI.
- Specification validation must include Storybook consumer-source and syntax-language lanes before broader catalog gates.

## DC-TOOL-004 — Docs MCP and llms catalog

**Requirement.** The Docs MCP and llms catalog family MUST publish the same bounded component and guidance documents through stdio, HTTP, CLI, and llms routes.

### Acceptance details

- Machine-readable output must be stable enough for repository automation.
- Tooling failures must report an actionable source path or command.
- Docs MCP and llms discovery must expose canonical specification files without rewriting their Markdown.
- The specification document catalog MUST include every `spec/src/SUMMARY.md` chapter and MUST NOT hard-code a stale chapter count.
