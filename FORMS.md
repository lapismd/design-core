# Forms and shared UI

Shared form contract for `@lapismd/design-core/forms`, derived from CV Studio's
`@cvstudio/forms` + `@cvstudio/ui` primitives.

## Shared form pattern

Prefer `@lapismd/design-core/forms` for **schema-shaped editing and CV form-row chrome**.
Use `@lapismd/design-core/shadcn/<family>` for generic controls (Select, Switch, Command,
Toggle Group, Input, Textarea, Field).

Default editable forms are row-based:

- labels on the left
- editable values on the right
- visible row separators
- proper-case labels and section titles

Compose fields inside a `cv-structured-form` / `ui-structured-form` scope
(provided by `StructuredForm`) so label columns align via CSS subgrid.

## Storybook catalog

| Section                     | Contents                                                         |
| --------------------------- | ---------------------------------------------------------------- |
| **UI Forms/Guidance**       | Decision guide                                                   |
| **UI Forms/Form Inputs/**   | Field controls (FormField, ListEditor, chips, pickers, …)        |
| **UI Forms/Layout/**        | Section chrome, collapsible lists, entry actions, choosers       |
| **UI Forms/Orchestrators/** | StructuredForm, YamlBackedForm, JsonBackedForm, PatchableForm    |
| **UI Forms/Editors/**       | CodeEditor, CodeHighlighter, YamlEditor                          |
| **UI Forms/Review/**        | UnifiedReviewDiff / FieldReviewActions composed with Form Inputs |

**Label/value alignment depends on subgrid, not on “using shared components”
alone.** Rows must be direct subgrid participants of that host:

- `FormField` (`.cv-form-field`)
- `.cv-control-row` / `.cv-control-row-group` (e.g. `ListEditor` header + items)

If a composite keeps its own `max-content | 1fr` tracks instead of
`grid-template-columns: subgrid`, its values start at a different x than sibling
rows — the recurring misalignment regression.

Inline `ListEditor` lists (Roles, Tags, …) are **full-bleed**, not value-column
fields: items span the full label/value grid (`data-ui-part="list-editor-items"`),
`SortableArrayItem` uses its normal inset for the drag gutter, and value text
matches the shared form control sizing (CV Tags parity). Do not put the items
wrapper in column 2 to “match” FormField values — that truncates borders and
breaks the Tags layout.

## Tokens

Forms expose a public token map like shadcn families:

- `formTokenNames` / `formTokenDefaults` / `@lapismd/design-core/forms/tokens`
- `form.tokens.css` — default bindings to theme tokens (`--border`, `--primary`, …)

Paint via colocated component CSS (no Tailwind utility classes in form sources).
Story wrappers may still use host Tailwind for demo layout. Each component Docs
page lists only the tokens that family reads, with defaults.

Override on `:root` or a form ancestor, e.g. `--ui-form-accent: oklch(...)`.

| Token                          | Default                                               |
| ------------------------------ | ----------------------------------------------------- |
| `--ui-form-background`         | `var(--background)`                                   |
| `--ui-form-foreground`         | `var(--foreground)`                                   |
| `--ui-form-muted`              | `var(--muted-foreground)`                             |
| `--ui-form-muted-surface`      | `var(--muted)`                                        |
| `--ui-form-border`             | `var(--border)`                                       |
| `--ui-form-border-muted`       | `color-mix(in srgb, var(--border) 70%, transparent)`  |
| `--ui-form-accent`             | `var(--primary)`                                      |
| `--ui-form-primary-foreground` | `var(--primary-foreground)`                           |
| `--ui-form-selection`          | `color-mix(in srgb, var(--primary) 12%, transparent)` |
| `--ui-form-selection-strong`   | `color-mix(in srgb, var(--primary) 30%, transparent)` |
| `--ui-form-active-line`        | `color-mix(in srgb, var(--primary) 9%, transparent)`  |
| `--ui-form-gutter`             | `color-mix(in srgb, var(--muted) 34%, transparent)`   |
| `--ui-form-popover`            | `var(--popover, var(--card))`                         |
| `--ui-form-panel-background`   | `var(--ui-form-background)`                           |
| `--ui-form-shadow`             | `rgb(15 23 42 / 22%)`                                 |
| `--ui-form-mono`               | `var(--font-mono, ui-monospace, monospace)`           |
| `--ui-form-code-background`    | `color-mix(in srgb, var(--muted) 34%, transparent)`   |
| `--ui-form-code-gutter`        | `color-mix(in srgb, var(--muted) 52%, transparent)`   |
| `--ui-form-column-gap`         | `1rem`                                                |
| `--ui-form-radius`             | `var(--radius, 0.625rem)`                             |

## Canonical primitives

| Need                        | Use                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| Label/value row             | `FormField`                                                                                    |
| Schema-shaped forms         | `StructuredForm` + `defineFormConfig<TValues>()` from `forms/core`                             |
| Sections / repeated entries | `FormSectionHeader`, `EntryActions`, `CollapsibleItemList`, `AddSectionChooser`                |
| Story / stub body outlines  | `FormPlaceholder` only (dotted). Real components render without outline.                       |
| 2–3 exclusive values        | `SegmentedControl` (or shadcn `ToggleGroup` when matching Actions UI)                          |
| Option menus                | shadcn `Select`; form-row icons/swap → `InlineOptionPicker`                                    |
| Sequential option browsing  | `CyclePicker`; typed `options` fields use `presentation: "cycle"`                              |
| Color values                | `ColorPicker`; typed fields use `kind: "color"`                                                |
| Tags / chip lists           | `ChipAutocomplete` (`tagListField` / `chipListField` / `stringListField`)                      |
| Ordered string lists        | `ListEditor` via `orderedStringListField` (or `reviewedStringListField` for Keep/Undo)         |
| Searchable choices          | `FilterCommandPicker` (bits-ui Command + Popover; options via props)                           |
| Dates                       | `DatePicker` (natural-language + shadcn Popover + `TaskDueCalendar`)                           |
| YAML dual mode              | `YamlBackedForm` + `YamlEditor`                                                                |
| JSON dual mode (legacy)     | `JsonBackedForm` + `CodeEditor` (`language="json"`)                                            |
| Credentials                 | `SecretField` (`env:NAME` or masked inline)                                                    |
| Patch Keep/Undo review      | `PatchableForm` + `reviewedTextField` / `reviewedStringListField` + `createOrAppendJsonReview` |
| Source editing              | `CodeEditor`                                                                                   |
| Read-only source preview    | `CodeHighlighter`                                                                              |

## Editor shell ownership

`CodeEditor` and `YamlEditor` keep the Design Core form APIs, language support,
diagnostics, YAML folding/formatting, and review decorations. Their CodeMirror
mounting, controlled-value lifecycle, editor chrome, sizing, gutters, selection,
and scroller behavior are owned by the linked `@lapismd/mira`
`MiraCodeEditor` shell.

Consumers continue importing the Design Core wrappers. Pass language or
domain-specific CodeMirror extensions through those wrappers; do not construct a
second `EditorView` or style the shell with `.cm-*` selectors. Design Core maps
its form tokens onto the public `--mira-code-editor-*` tokens. `SearchFilterBar`
retains its compact filter-query editor lifecycle until Mira has a dedicated
inline/searchbox shell contract.

Mira's built-in Find/Replace panel is part of the editor shell. Its surface,
inputs, buttons, hover/active states, and focus ring inherit the same form
background, border, muted, active-line, and accent tokens as the editor.

## Config-driven forms

Use `defineFormConfig<TValues>()` for new schema-shaped forms. Field keys are
typed nested paths, including numeric array segments, and each field kind,
default, validator, and factory is checked against the value at that path.
Record insertion order controls field order; ungrouped fields render first,
then groups in group-record order.

`StructuredForm` is controlled: the consumer supplies `value` and `onChange`.
`createFormController<TValues>()` owns only form metadata—dirty/touched state,
validation, field focus, disclosure, repeat identities, and reset baselines.
Persistence, submission, routing, and domain state stay with the consumer.

Arrays support primitive `itemField` values, homogeneous object `itemConfig`
values, and discriminated `variant-array` values. Use `appearance="subsection"`
with `addButtonPresentation="panel"` for a nested titled collection; these are
shared component variants, not story CSS. `hideItemLabels` removes redundant
single-value labels visually while retaining accessible names.

Downstream field kinds augment `FormFieldKindMap` in
`@lapismd/design-core/forms/core` and register their renderer on an explicit
`createFormRendererRegistry()`. Registries are isolated. Duplicate registration
requires `{ replace: true }` and returns a disposer; a missing runtime renderer
is rendered as an accessible developer error.

The callback-based `createFormConfig` and field builders remain supported for
manual adapters and custom composition.

## Borderline shared components

These stay in shared forms when callers supply domain data via props:

- `ReferencePicker` — reference index from the app
- `TaskDueCalendar` — generic calendar control (until a shadcn calendar lands)
- `DatePicker` — natural-language / semantic dates + `TaskDueCalendar` (no calendar recipe yet)
- `FilterCommandPicker` — searchable single/multi picker; host supplies options
- `AddSectionChooser` — option lists from the app

Search chrome and filter-query language live in `@lapismd/design-core/filter`
(`SearchFilterBar`). Compose them from forms (see
**UI Forms/Form Inputs/Search Filter in a Form**); do not treat the bar as a
forms primitive.

## Storybook

`UI Forms/Guidance` is the high-level decision guide. Each form component has a
Docs page (when/when-not, usage, properties, variations) colocated next to its
stories — same pattern as Shadcn. Every visual form export must also have a
colocated interaction story covering its meaningful states.

Regenerate Docs scaffolding with `node scripts/generate-form-docs.mjs` when
adding a new shared form export (then edit the generated MDX guidance as needed).
