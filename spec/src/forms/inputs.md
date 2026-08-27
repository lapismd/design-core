# Forms / Inputs

Form inputs provide higher-level controlled editing patterns composed from shared primitives. Cross-family composition follows the canonical [`Forms guidance`](guidance.md).

## Public surface coverage

| Surface                 | Public boundary              | Requirement |
| ----------------------- | ---------------------------- | ----------- |
| Autocomplete Input      | `@lapismd/design-core/forms` | DC-FORM-007 |
| Chip Autocomplete       | `@lapismd/design-core/forms` | DC-FORM-008 |
| Color Picker            | `@lapismd/design-core/forms` | DC-FORM-009 |
| Cycle Picker            | `@lapismd/design-core/forms` | DC-FORM-010 |
| Date Picker             | `@lapismd/design-core/forms` | DC-FORM-011 |
| Filter Command Picker   | `@lapismd/design-core/forms` | DC-FORM-012 |
| Inline Option Picker    | `@lapismd/design-core/forms` | DC-FORM-013 |
| List Editor             | `@lapismd/design-core/forms` | DC-FORM-014 |
| Password Input          | `@lapismd/design-core/forms` | DC-FORM-043 |
| Reference Picker        | `@lapismd/design-core/forms` | DC-FORM-015 |
| Secret Field            | `@lapismd/design-core/forms` | DC-FORM-016 |
| Segmented Control       | `@lapismd/design-core/forms` | DC-FORM-017 |
| Task Due Calendar       | `@lapismd/design-core/forms` | DC-FORM-018 |
| Time Picker             | `@lapismd/design-core/forms` | DC-FORM-019 |
| Search Filter in a Form | Catalogued composition       | DC-FORM-020 |

## DC-FORM-006 — Shared Forms invariants

**Requirement.** Forms families MUST preserve accessible labelling, controlled value ownership, exact update types, token-driven focus and invalid states, and consumer-composable layout.

### Acceptance details

- Display-only defaults must remain absent from authoritative values until the consumer edits the field.
- Array and disclosure metadata must remain outside consumer values unless explicitly part of the configured schema.

## DC-FORM-007 — Autocomplete Input

**Requirement.** The Autocomplete Input family MUST combine text entry, suggestions, keyboard navigation, and controlled selection.

### Acceptance details

- The public boundaries are `@lapismd/design-core/forms` and the focused `@lapismd/design-core/forms/filter-command-picker` entry point.
- The catalog MUST demonstrate the family’s supported states and portal placement options without introducing a second runtime contract.
- Moving focus outside an open autocomplete MUST close its suggestion list without restoring focus to the input and reopening it.
- Opening an autocomplete with an existing value MUST focus the input, select the committed text, and expose alternative suggestions before the user types.

## DC-FORM-008 — Chip Autocomplete

**Requirement.** The Chip Autocomplete family MUST edit an ordered controlled set of token values with suggestions, keyboard removal, and accessible labels.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- A disabled group MUST disable each segment, suppress value changes, and keep the selected value readable.
- The family MUST forward suggestion popover portal configuration to its internal Autocomplete Input so sheet, dialog, and popover consumers can keep nested suggestion clicks inside the owning workflow.

## DC-FORM-009 — Color Picker

**Requirement.** The Color Picker family MUST edit a controlled color value through text and visual affordances with circular swatches and accessible naming.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- Popover presentation MUST keep its icon-only trigger and editable palette adjacent through owner-document collision-aware positioning.
- Popover presentation MUST render supplied presets alongside a native any-color swatch and editable text value.
- Inline presentation MUST retain the existing native swatch and text editor contract.

## DC-FORM-010 — Cycle Picker

**Requirement.** The Cycle Picker family MUST cycle a controlled option through previous, current, and next controls with overflow-safe current text.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-011 — Date Picker

**Requirement.** The Date Picker family MUST edit a controlled date using typed input and calendar selection with locale-aware accessible labels.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-012 — Filter Command Picker

**Requirement.** The Filter Command Picker family MUST select filter commands through searchable keyboard-accessible options without owning query persistence.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-013 — Inline Option Picker

**Requirement.** The Inline Option Picker family MUST render a compact controlled option choice with accessible selected state.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-014 — List Editor

**Requirement.** The List Editor family MUST add, edit, reorder, and remove controlled ordered values with configurable markers and actions.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- Editable list values MUST wrap and autosize without horizontal or vertical clipping.

## DC-FORM-043 — Password Input

**Requirement.** The Password Input family MUST mask a controlled secret by default and reveal it only while an overlay toggle inside a single Input is active.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The control MUST compose one Input with a borderless overlay reveal and MUST NOT add Input Group or a second input chrome.
- Reveal hover and focus-visible MUST use a circular wash and MUST NOT paint a button border.
- Focus-visible on the Input MUST keep a single ring and MUST NOT keep a second border.

## DC-FORM-015 — Reference Picker

**Requirement.** The Reference Picker family MUST select a controlled reference from searchable options with clear empty and unresolved states.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- The add-reference search surface MUST compose `@lapismd/design-core/shadcn/command-view` and MUST NOT own overlay chrome.

## DC-FORM-016 — Secret Field

**Requirement.** The Secret Field family MUST edit sensitive text with explicit reveal controls and accessible state without persisting the value.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-017 — Segmented Control

**Requirement.** The Segmented Control family MUST select one controlled option from a labelled keyboard-accessible segment group.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-018 — Task Due Calendar

**Requirement.** The Task Due Calendar family MUST edit task due dates through calendar semantics and controlled updates.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-019 — Time Picker

**Requirement.** The Time Picker family MUST edit a controlled time value with keyboard-accessible hour and minute controls.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-020 — Search Filter in a Form

**Requirement.** The Search Filter in a Form family MUST demonstrate the shared filter-query picker inside form chrome using public components.

### Acceptance details

- The public boundary is Catalogued composition.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
