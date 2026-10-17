# Forms / Inputs

Picker option and preview types are exported from TypeScript modules so strict source consumers can use the Forms barrel without Svelte type synthesis.

Form inputs provide higher-level controlled editing patterns composed from shared primitives. Cross-family composition follows the canonical [`Forms guidance`](guidance.md). Strict source-consumer compatibility for shared input helpers follows the shared Forms invariants in [`Forms / Core and orchestrators`](core-and-orchestrators.md#dc-form-001--shared-forms-invariants).

## Public surface coverage

| Surface                 | Public boundary                                         | Requirement |
| ----------------------- | ------------------------------------------------------- | ----------- |
| Autocomplete Input      | `@lapismd/design-core/forms`                            | DC-FORM-007 |
| Chip Autocomplete       | `@lapismd/design-core/forms`                            | DC-FORM-008 |
| Color Picker            | `@lapismd/design-core/forms`                            | DC-FORM-009 |
| Cycle Picker            | `@lapismd/design-core/forms`                            | DC-FORM-010 |
| Date Picker             | `@lapismd/design-core/forms`                            | DC-FORM-011 |
| Filter Command Picker   | `@lapismd/design-core/forms`                            | DC-FORM-012 |
| Inline Option Picker    | `@lapismd/design-core/forms`                            | DC-FORM-013 |
| List Editor             | `@lapismd/design-core/forms`                            | DC-FORM-014 |
| Password Input          | `@lapismd/design-core/forms`                            | DC-FORM-043 |
| Reference Picker        | `@lapismd/design-core/forms`                            | DC-FORM-015 |
| Secret Field            | `@lapismd/design-core/forms`                            | DC-FORM-016 |
| Segmented Control       | `@lapismd/design-core/forms`                            | DC-FORM-017 |
| Task Due Calendar       | `@lapismd/design-core/forms`                            | DC-FORM-018 |
| Time Picker             | `@lapismd/design-core/forms`                            | DC-FORM-019 |
| Search Filter in a Form | Catalogued composition                                  | DC-FORM-020 |
| Avatar Picker           | `@lapismd/design-core/forms` and `/forms/avatar-picker` | DC-FORM-047 |

| Quantity Input | `@lapismd/design-core/forms/quantity-input` | DC-FORM-048 |

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
- Moving focus outside an open autocomplete MUST close its suggestion list without restoring focus to the input and reopening it; delayed popover teardown MUST preserve the explicitly chosen next focus target.
- Opening an autocomplete with an existing value MUST focus the input, select the committed text, and expose alternative suggestions before the user types; deferred opening selection MUST preserve subsequent typing and keyboard caret movement.

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
- Selection acceptance MUST confirm that the option popup has closed before auditing the settled accessible state.

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

## DC-FORM-047 — Avatar Picker

Catalog emoji selection waits for the expected selectable emoji after the lazy
library mounts, rather than treating its search input as grid readiness.

**Requirement.** Avatar Picker MUST edit host-owned avatar values through image selection/drop, pasted URLs and emoji on a chosen background, using host-provided initials or name as the empty-image fallback.

### Acceptance details

- The avatar trigger MUST include an edit-icon cut-out and hover/focus feedback with host-configured circle/rounded shape and size, supporting both popover and inline editors with Done and removal actions rather than end-user shape or initials options.
- The editor MUST compose Avatar and inline EmojiPicker with image selection/drop, pasted URLs, emoji and background colour for every type including transparent images, host-provided initials/name fallback, shared styled ScrollArea popover overflow, disabled/pending/failed-upload presentation and local previews without an uploader.
- A newer choice, external value change, disabling or disposal MUST invalidate stale asynchronous uploads without replacing the retained value, while hosts own uploading and persistence.
- Public boundaries MUST include Forms and its focused `forms/avatar-picker` entry point, with custom emoji records using the shared neutral EmojiPicker model.

## DC-FORM-048 — Quantity Input

**Requirement.** QuantityInput MUST compose exact canonical integer values with supplied display units, optional reset and slider controls.

### Acceptance details

- Switching display units MUST never emit a canonical edit or silently round the retained value.
- Empty, fractional, unsafe and out-of-range drafts MUST remain distinguishable and retain their input text with accessible validation.
- Reset and optional sliders MUST retain bounds, keyboard focus and disabled or read-only behaviour without allocating unbounded step arrays.
