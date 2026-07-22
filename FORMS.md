# Forms and shared UI

Shared form contract for `@stevejuma/ui/forms`, derived from CV Studio's
`@cvstudio/forms` + `@cvstudio/ui` primitives.

## Shared form pattern

Prefer `@stevejuma/ui/forms` for **schema-shaped editing and CV form-row chrome**.
Use `@stevejuma/ui/shadcn/<family>` for generic controls (Select, Switch, Command,
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
fields: items use `col-span-full` so borders span the row, `SortableArrayItem`
`pl-5` for the drag gutter, and `text-sm leading-5` values (CV Tags parity).
Do not put the items wrapper in column 2 to “match” FormField values — that
truncates borders and breaks the Tags layout.

## Tokens

Forms expose a public token map like shadcn families:

- `formTokenNames` / `@stevejuma/ui/forms/tokens` — `--ui-form-*` names
- `form.tokens.css` — default bindings to theme tokens (`--border`, `--primary`, …)

Override on `:root` or a form ancestor, e.g. `--ui-form-accent: oklch(...)`.

## Canonical primitives

| Need                        | Use                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| Label/value row             | `FormField`                                                                                    |
| Schema-shaped forms         | `StructuredForm` + builders from `forms/core`                                                  |
| Sections / repeated entries | `FormSectionHeader`, `EntryActions`, `CollapsibleItemList`, `AddSectionChooser`                |
| Story / stub body outlines  | `FormPlaceholder` only (dotted). Real components render without outline.                       |
| 2–3 exclusive values        | `SegmentedControl` (or shadcn `ToggleGroup` when matching Actions UI)                          |
| Option menus                | shadcn `Select`; form-row icons/swap → `InlineOptionPicker`                                    |
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

## Borderline shared components

These stay in shared forms when callers supply domain data via props:

- `ReferencePicker` — reference index from the app
- `TaskDueCalendar` — generic calendar control (until a shadcn calendar lands)
- `DatePicker` — natural-language / semantic dates + `TaskDueCalendar` (no calendar recipe yet)
- `FilterCommandPicker` — searchable single/multi picker; host supplies options
- `AddSectionChooser` — option lists from the app

Search chrome and filter-query language live in `@stevejuma/ui/filter`
(`SearchFilterBar`). Compose them from forms (see
**UI Forms/Form Inputs/Search Filter in a Form**); do not treat the bar as a
forms primitive.

## App-specific form work

Custom `*FormField.svelte` renderers and CV/beancount domain editors belong under
`src/apps/cv` or `src/apps/beancount`, not in shared forms.

The living CV form composition is **`CvWorkspaceForm`** (`Apps/CV/CV Form`): five
tabs (CV / Evidence / Design / Locale / Settings), section editors, YAML mode,
and prop-driven fixtures — no host app store.

## Storybook

`UI Forms/Guidance` is the high-level decision guide. Each form component has a
Docs page (when/when-not, usage, properties, variations) colocated next to its
stories — same pattern as Shadcn. Every visual form export must also have a
colocated interaction story covering its meaningful states.

Regenerate Docs scaffolding with `node scripts/generate-form-docs.mjs` when
adding a new shared form export (then edit the generated MDX guidance as needed).
