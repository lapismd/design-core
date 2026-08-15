# Forms / Examples

Examples prove consumer composition without adding CV-specific runtime exports. Cross-family composition follows the canonical [`Forms guidance`](guidance.md).

## Public surface coverage

| Surface          | Public boundary   | Requirement |
| ---------------- | ----------------- | ----------- |
| Complete CV Form | Storybook example | DC-FORM-041 |

## DC-FORM-040 — Shared Forms invariants

**Requirement.** Forms families MUST preserve accessible labelling, controlled value ownership, exact update types, token-driven focus and invalid states, and consumer-composable layout.

### Acceptance details

- Display-only defaults must remain absent from authoritative values until the consumer edits the field.
- Array and disclosure metadata must remain outside consumer values unless explicitly part of the configured schema.

## DC-FORM-041 — Complete CV Form

**Requirement.** The Complete CV Form family MUST demonstrate the complete config-driven form surface, all nine CV entry variants, YAML round-tripping, responsive panes, and reset behavior from a story-local sample.

### Acceptance details

- The public boundary is Storybook example.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- The form shell MUST zero `--ui-shell-main-block-inset`, `--ui-shell-main-radius`, `--ui-shell-main-shadow`, and `--ui-shell-main-border` so the surface fills its host edge to edge.
