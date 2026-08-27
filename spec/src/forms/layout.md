# Forms / Layout

Form layout families provide reusable chrome for sections, fields, repeaters, actions, and sheets. Cross-family composition follows the canonical [`Forms guidance`](guidance.md).

## Public surface coverage

| Surface               | Public boundary              | Requirement |
| --------------------- | ---------------------------- | ----------- |
| Add Section Chooser   | `@lapismd/design-core/forms` | DC-FORM-022 |
| Collapsible Item List | `@lapismd/design-core/forms` | DC-FORM-023 |
| Entry Actions         | `@lapismd/design-core/forms` | DC-FORM-024 |
| Form Add Button       | `@lapismd/design-core/forms` | DC-FORM-025 |
| Form Field            | `@lapismd/design-core/forms` | DC-FORM-026 |
| Form Placeholder      | `@lapismd/design-core/forms` | DC-FORM-027 |
| Form Section Header   | `@lapismd/design-core/forms` | DC-FORM-028 |
| Form Sheet            | `@lapismd/design-core/forms` | DC-FORM-029 |
| Form Toolbar          | `@lapismd/design-core/forms` | DC-FORM-030 |
| Sortable Array Item   | `@lapismd/design-core/forms` | DC-FORM-031 |

## DC-FORM-021 — Shared Forms invariants

**Requirement.** Forms families MUST preserve accessible labelling, controlled value ownership, exact update types, token-driven focus and invalid states, and consumer-composable layout.

### Acceptance details

- Display-only defaults must remain absent from authoritative values until the consumer edits the field.
- Array and disclosure metadata must remain outside consumer values unless explicitly part of the configured schema.

## DC-FORM-022 — Add Section Chooser

**Requirement.** The Add Section Chooser family MUST offer labelled section factories through a prominent accessible chooser.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- Idle chooser options must meet WCAG AA text contrast while retaining distinct hover and focus states.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-023 — Collapsible Item List

**Requirement.** The Collapsible Item List family MUST compose repeated controlled items with disclosure, move, remove, and add affordances.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- Consumers MUST be able to supply an item-specific drag label and Arrow Up or Arrow Down reorder controller.
- The catalog MUST demonstrate pointer, keyboard, and remove controllers without owning the repeated collection.

## DC-FORM-024 — Entry Actions

**Requirement.** The Entry Actions family MUST provide compact labelled move, remove, and related row actions.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- Remove-action hover paint MUST read the public `--ui-sortable-array-item-remove-hover-background` token, which defaults to transparent.

## DC-FORM-025 — Form Add Button

**Requirement.** The Form Add Button family MUST provide a low-emphasis add action that becomes prominent on hover and focus.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-026 — Form Field

**Requirement.** The Form Field family MUST compose label, control, description, required state, and errors without forcing a renderer.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- Text-like controls MUST use the available value track, wrap long content, and grow to keep every line readable.

## DC-FORM-027 — Form Placeholder

**Requirement.** The Form Placeholder family MUST represent an intentionally unavailable or empty form region with explanatory content.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-028 — Form Section Header

**Requirement.** The Form Section Header family MUST compose section title, disclosure, movement, removal, and divider treatment.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-029 — Form Sheet

**Requirement.** The Form Sheet family MUST provide a readable token-driven container for structured form content.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-030 — Form Toolbar

**Requirement.** The Form Toolbar family MUST group form-wide actions and mode controls responsively.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-031 — Sortable Array Item

**Requirement.** The Sortable Array Item family MUST compose a controlled repeated item with stable drag, keyboard move, and remove actions.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
