# Component audit

Classification for the reusable `@stevejuma/ui` package. Update this file when
components move between shared layers.

## Shared — shadcn

Generic primitives in `src/shared/shadcn/`:

accordion, alert, alert-dialog, badge, button, card, collapsible, command,
dialog, dropdown-menu, empty, field, input, input-group, label, popover,
resizable, scroll-area, select, separator, sheet, sidebar, skeleton, spinner,
switch, tabs, textarea, toggle, toggle-group, tooltip

Import: `@stevejuma/ui/shadcn/<family>`

All families are converted to scoped native CSS with token maps and provenance
files through `pnpm ui:add` / `pnpm ui:add:batch`.

Batch commands: `pnpm ui:add:batch a` (simple roots), `b`
(stateful/light compound), `c` (portals), and `d` (layout/field compounds).
Inspect a family with `pnpm ui:inspect <name>`.

## Shared — forms

Config-driven form engine and field primitives in
`src/shared/forms/<family>/`.

**Engine** (`structured-form/`, `core/`): `StructuredForm`,
`FormFieldRenderer`, `FormViewRenderer`, `YamlBackedForm`, `JsonBackedForm`,
`PatchableForm`, builders, types, registry, JSON Patch, and review-diff
utilities.

**Primitives:** `form-field`, `form-section-header`, `form-toolbar`,
`form-add-button`, `form-sheet`, `entry-actions`, `collapsible-item-list`,
`add-section-chooser`, `segmented-control`, `inline-option-picker`,
`autocomplete-input`, `chip-autocomplete`, `list-editor`,
`sortable-array-item`, `secret-field`, `filter-command-picker`,
`date-picker`, `reference-picker`, `task-due-calendar`, and `form-review`.

Removed duplicate/thin aliases:

- `choice-menu` — use Select.
- `tag-editor` — use `ChipAutocomplete`.
- `searchable-choice-picker` — use `FilterCommandPicker`.
- `read-only-form` — use readonly `FormField` or `ReferencePicker`.

**Runtime editors:** `code-editor`, `code-highlighter`, `yaml-editor`.

**Patch review:** `PatchableForm` orchestrates Keep/Undo over structured fields
and YAML hunks. `form-review/` provides `UnifiedReviewDiff`,
`FieldReviewActions`, and reviewed field renderers built on `FormField` and
`ListEditor`.

Borderline but shared when prop-driven: `ReferencePicker`,
`TaskDueCalendar`, `DatePicker`, `FilterCommandPicker`, and
`AddSectionChooser`.

Import: `@stevejuma/ui/forms` and `@stevejuma/ui/forms/core`

## Shared — filter

Search chrome and structured filter-query language in `src/shared/filter/`:

- `PowerSearch` — field/operator/value tokens and a field combobox.
- `SearchFilterBar` — plain or `filter-query` CodeMirror mode plus
  host-supplied `filterSyntax` autocomplete.
- `filter-query/` — Lezer grammar, `parseFilterQuery`, and `filterQuery()`
  language support.

Import: `@stevejuma/ui/filter`. Catalog: `Filter/...`. Guidance:
`Filter/Guidance`. Forms may compose the bar; do not re-export it from the
forms barrel.

## Shared — AI

Presentational AI chat chrome in `src/shared/ai/`, with no network or host-store
dependency. Storybook: `AI/...`.

- `AiChatDock` — placement and visibility.
- `AiChatTranscript` — message list and optional review summary.
- `AiPromptInput` — composer and `onSend`.
- `AiChatPanelSettings` — placement and collapse controls.
- `AiChatPanel` — dock, transcript, and prompt composition.
- `chat/` — reusable ASTRYX-inspired message/layout, composer, token,
  dictation, and tool-call primitives. Stable imports use
  `@stevejuma/ui/ai/chat`.
- `chat/experimental/` — Lab-derived reasoning, reaction, emoji, typing, and
  unread primitives. Every export is marked `@experimental`; import from
  `@stevejuma/ui/ai/chat/experimental`.

Import: `@stevejuma/ui/ai`, `@stevejuma/ui/ai/chat`, and
`@stevejuma/ui/ai/chat/experimental`.

## Shared — later

- Markdown stack: editor, preview, TOC, Carta, Mermaid.
- `FlipCardDeck` and `StructuredTable*`.
