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

## Tokens

Forms expose a public token map like shadcn families:

- `formTokenNames` / `@stevejuma/ui/forms/tokens` — `--ui-form-*` names
- `form.tokens.css` — default bindings to theme tokens (`--border`, `--primary`, …)

Override on `:root` or a form ancestor, e.g. `--ui-form-accent: oklch(...)`.
Legacy `--cv-form-*` / `--cv-control-column-gap` remain as read aliases.

## Canonical primitives

| Need                        | Use                                                                             |
| --------------------------- | ------------------------------------------------------------------------------- |
| Label/value row             | `FormField`                                                                     |
| Schema-shaped forms         | `StructuredForm` + builders from `forms/core`                                   |
| Sections / repeated entries | `FormSectionHeader`, `EntryActions`, `CollapsibleItemList`, `AddSectionChooser` |
| Story / stub body outlines  | `FormPlaceholder` (dotted); `EntryActions` / `CollapsibleItemList` bodies always outline content |
| 2–3 exclusive values        | `SegmentedControl` (or shadcn `ToggleGroup` when matching Actions UI)           |
| Option menus                | shadcn `Select`; form-row icons/swap → `InlineOptionPicker`                     |
| Tags / chip lists           | `ChipAutocomplete` (`tagListField` / `chipListField` builders)                  |
| Searchable choices          | App pickers on shadcn `Command` + `Popover`                                     |
| YAML dual mode              | `YamlBackedForm` + `YamlEditor`                                                 |
| Source editing              | `CodeEditor`                                                                    |

## Borderline shared components

These stay in shared forms when callers supply domain data via props:

- `ReferencePicker` — reference index from the app
- `TaskDueCalendar` — generic calendar control (until a shadcn calendar lands)
- `SearchFilterBar` — search chrome; filter semantics from the app
- `AddSectionChooser` — option lists from the app

## App-specific form work

Custom `*FormField.svelte` renderers and CV/beancount domain editors belong under
`src/apps/cv` or `src/apps/beancount`, not in shared forms.

## Storybook

`UI Forms/Guidance` is the high-level decision guide. Each form component has a
Docs page (when/when-not, usage, properties, variations) colocated next to its
stories — same pattern as Shadcn. Every visual form export must also have a
colocated interaction story covering its meaningful states.

Regenerate Docs scaffolding with `node scripts/generate-form-docs.mjs` when
adding a new shared form export (then edit the generated MDX guidance as needed).
