# Forms / Editors

Editor families separate language or review behavior from the Mira-owned CodeMirror shell and static highlighting. Cross-family composition follows the canonical [`Forms guidance`](guidance.md).

## Public surface coverage

| Surface          | Public boundary              | Requirement |
| ---------------- | ---------------------------- | ----------- |
| Code Editor      | `@lapismd/design-core/forms` | DC-FORM-033 |
| Code Highlighter | `@lapismd/design-core/forms` | DC-FORM-034 |
| YAML Editor      | `@lapismd/design-core/forms` | DC-FORM-035 |

## DC-FORM-032 — Shared Forms invariants

**Requirement.** Forms families MUST preserve accessible labelling, controlled value ownership, exact update types, token-driven focus and invalid states, and consumer-composable layout.

### Acceptance details

- Display-only defaults must remain absent from authoritative values until the consumer edits the field.
- Array and disclosure metadata must remain outside consumer values unless explicitly part of the configured schema.

## DC-FORM-033 — Code Editor

**Requirement.** The Code Editor family MUST provide controlled language-aware CodeMirror editing, diagnostics, IntelliSense extensions, and accessible framed or frameless surfaces through Mira-owned editor chrome.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-034 — Code Highlighter

**Requirement.** The Code Highlighter family MUST render static highlighted code through the dependency-light ASTRYX-derived tokenization path.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-035 — YAML Editor

**Requirement.** The YAML Editor family MUST provide controlled YAML editing, folding, formatting, invalid state, and review decorations through the Mira-owned CodeMirror shell.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- Linked consumers MAY resolve compatible CodeMirror peer patch versions during type checking, while the host MUST still deduplicate the runtime singleton.
