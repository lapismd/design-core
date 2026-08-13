# Specification governance

Specification governance keeps requirements discoverable, mapped, validated, and changed before or with protected implementation.

## Public surface coverage

| Surface                   | Public boundary | Requirement |
| ------------------------- | --------------- | ----------- |
| Requirement identifiers   | Governance      | DC-GOV-001  |
| Verification matrix       | Governance      | DC-GOV-002  |
| Specification validation  | Governance      | DC-GOV-003  |
| Spec-first classification | Governance      | DC-GOV-004  |
| QMD indexing              | Governance      | DC-GOV-005  |
| QMD discovery             | Governance      | DC-GOV-006  |
| Agent authority           | Governance      | DC-GOV-007  |
| Generated artifacts       | Governance      | DC-GOV-008  |
| Storybook source checks   | Governance      | DC-GOV-009  |

## DC-GOV-001 — Requirement identifiers

**Requirement.** The Requirement identifiers family MUST assign every normative behavior a unique `DC-<AREA>-NNN` identifier and a concise requirement statement.

### Acceptance details

- A diagnostic must identify its stable code, governing requirement, source path, line when available, affected identifier, and corrective action.
- Generated or discovery surfaces must point back to canonical Markdown rather than becoming a second source of truth.

## Change map

| Protected area                                            | Owning canonical chapter         |
| --------------------------------------------------------- | -------------------------------- |
| Root package manifests and exports                        | `architecture.md`, `packages.md` |
| Shared styles, themes, and tokens                         | `styling-and-themes.md`          |
| Shadcn families                                           | Matching chapter under `shadcn/` |
| Forms families                                            | Matching chapter under `forms/`  |
| Filter layer                                              | `filter.md`                      |
| AI layer                                                  | `ai.md`                          |
| Shell layer                                               | `shell.md`                       |
| Workspace framework                                       | `workspace/framework.md`         |
| Workspace components                                      | `workspace/components.md`        |
| Workspace panels                                          | `workspace/panels.md`            |
| Workspace plugins                                         | `workspace/plugins.md`           |
| Storybook host and specification mirrors                  | `storybook-catalog.md`           |
| UI generator and Docs MCP tooling                         | `tooling.md`                     |
| Specification validators, book, map, QMD, and agent rules | `spec-governance.md`             |

## DC-GOV-002 — Verification matrix

**Requirement.** The Verification matrix family MUST map every requirement to exactly one verification row with an explicit status and source or test evidence.

### Acceptance details

- A diagnostic must identify its stable code, governing requirement, source path, line when available, affected identifier, and corrective action.
- Generated or discovery surfaces must point back to canonical Markdown rather than becoming a second source of truth.

## DC-GOV-003 — Specification validation

**Requirement.** The Specification validation family MUST validate summary coverage, local links, requirement structure, verification cardinality, public-surface mappings, mirrors, and ignored generated output.

### Acceptance details

- A diagnostic must identify its stable code, governing requirement, source path, line when available, affected identifier, and corrective action.
- Generated or discovery surfaces must point back to canonical Markdown rather than becoming a second source of truth.
- Mirror validation must reject missing, stale, misordered, retargeted, or prose-bearing Storybook pages.
- Public-surface validation must map every root export to exactly one owning requirement.

## DC-GOV-004 — Spec-first classification

**Requirement.** The Spec-first classification family MUST fail closed when a production or tooling change lacks the owning canonical chapter in the same local or CI diff.

### Acceptance details

- A diagnostic must identify its stable code, governing requirement, source path, line when available, affected identifier, and corrective action.
- Generated or discovery surfaces must point back to canonical Markdown rather than becoming a second source of truth.

## DC-GOV-005 — QMD indexing

**Requirement.** The QMD indexing family MUST index only canonical specification Markdown in a tracked Design Core collection and keep databases, embeddings, and models untracked.

### Acceptance details

- A diagnostic must identify its stable code, governing requirement, source path, line when available, affected identifier, and corrective action.
- Generated or discovery surfaces must point back to canonical Markdown rather than becoming a second source of truth.

## DC-GOV-006 — QMD discovery

**Requirement.** The QMD discovery family MUST refresh lexical search before discovery, support opt-in semantic search, report paths and line numbers, and provide actionable fallback diagnostics.

### Acceptance details

- A diagnostic must identify its stable code, governing requirement, source path, line when available, affected identifier, and corrective action.
- Generated or discovery surfaces must point back to canonical Markdown rather than becoming a second source of truth.

## DC-GOV-007 — Agent authority

**Requirement.** The Agent authority family MUST teach repository agents the specification authority order, authoring rules, path ownership map, search workflow, and required validation.

### Acceptance details

- A diagnostic must identify its stable code, governing requirement, source path, line when available, affected identifier, and corrective action.
- Generated or discovery surfaces must point back to canonical Markdown rather than becoming a second source of truth.

## DC-GOV-008 — Generated artifacts

**Requirement.** The Generated artifacts family MUST keep generated mdBook output and QMD caches ignored and untracked.

### Acceptance details

- A diagnostic must identify its stable code, governing requirement, source path, line when available, affected identifier, and corrective action.
- Generated or discovery surfaces must point back to canonical Markdown rather than becoming a second source of truth.

## DC-GOV-009 — Storybook documentation checks

**Requirement.** Specification validation MUST inspect Autodocs consumer source and authored documentation code examples.

### Acceptance details

- Validation must reject missing or incomplete explicit source metadata for demo, harness, fixture, and story-surface boundaries.
- Validation must reject example source that exposes story-only component names or inferred args as consumer usage.
- Validation must reject language values that the current Storybook highlighter renders without syntax tokens.
