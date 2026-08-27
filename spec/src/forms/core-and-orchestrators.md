# Forms / Core and orchestrators

Forms core supplies manual and config-driven controlled rendering. Orchestrators add structured text and review workflows without owning persistence. Cross-family composition follows the canonical [`Forms guidance`](guidance.md).
Masked secrets use the Password Input family under Forms / Inputs rather than these orchestrators.

## Public surface coverage

| Surface          | Public boundary                                | Requirement |
| ---------------- | ---------------------------------------------- | ----------- |
| Structured Form  | `@lapismd/design-core/forms` and `/forms/core` | DC-FORM-002 |
| YAML Backed Form | `@lapismd/design-core/forms`                   | DC-FORM-003 |
| JSON Backed Form | `@lapismd/design-core/forms`                   | DC-FORM-004 |
| Patchable Form   | `@lapismd/design-core/forms`                   | DC-FORM-005 |

## DC-FORM-001 — Shared Forms invariants

**Requirement.** Forms families MUST preserve accessible labelling, controlled value ownership, exact update types, token-driven focus and invalid states, and consumer-composable layout.

### Acceptance details

- Display-only defaults must remain absent from authoritative values until the consumer edits the field.
- Array and disclosure metadata must remain outside consumer values unless explicitly part of the configured schema.
- Shared Form tokens MUST give component-specific sortable remove-action hover paint a transparent default while allowing ancestor overrides.

## DC-FORM-002 — Structured Form

**Requirement.** The Structured Form family MUST render manual and type-safe path configurations, groups, repeaters, variants, defaults, field state, validation, and explicit renderer registries through controlled values.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms` and `/forms/core`; catalog usage documentation MUST render a consumer-facing typed configuration example with Storybook-supported syntax highlighting.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- Controller-wide disclosure actions MUST target visible group and section controls while hidden-header wrapper groups remain rendered.
- Editable text, email, search, telephone, and URL fields MUST wrap and autosize instead of clipping horizontally, including after their container width changes.

## DC-FORM-003 — YAML Backed Form

**Requirement.** The YAML Backed Form family MUST round-trip a configured structured form with YAML text while preserving invalid edited text and the last valid structured value.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-004 — JSON Backed Form

**Requirement.** The JSON Backed Form family MUST round-trip a configured structured form with JSON text while preserving controlled values and actionable parse errors.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-005 — Patchable Form

**Requirement.** The Patchable Form family MUST compose controlled form editing with patch review, acceptance, rejection, and externally owned persistence.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
