# Tooling

Repository tools keep source generation, discovery, documentation, and validation reproducible for humans and agents. The catalog CLI lists Diff families, including File Change Stats and Merge Editor, beside shadcn, forms, filter, and AI.

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

## DC-TOOL-003 — Validation commands

**Requirement.** The Validation commands family MUST provide focused formatting, type, unit, Storybook, source-style, browser, build, and visual-comparison commands.

### Acceptance details

- Machine-readable output must be stable enough for repository automation.
- Tooling failures must report an actionable source path or command.
- Specification commands must retain separate validation, build, spec-first, index, search, and serve entry points through the configured shared CLI.
- Specification validation must include Storybook consumer-source and syntax-language lanes before broader catalog gates.

## DC-TOOL-004 — Docs MCP and llms catalog

**Requirement.** The Docs MCP and llms catalog family MUST publish the same bounded component and guidance documents through stdio, HTTP, CLI, and llms routes.

### Acceptance details

- Machine-readable output must be stable enough for repository automation.
- Tooling failures must report an actionable source path or command.
- Docs MCP and llms discovery must expose canonical specification files without rewriting their Markdown.
