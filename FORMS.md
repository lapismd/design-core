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

Compose fields inside a `cv-structured-form` scope (provided by
`StructuredForm`) so label columns align via CSS subgrid.

## Canonical primitives

| Need                        | Use                                                                             |
| --------------------------- | ------------------------------------------------------------------------------- |
| Label/value row             | `FormField`                                                                     |
| Schema-shaped forms         | `StructuredForm` + builders from `forms/core`                                   |
| Sections / repeated entries | `FormSectionHeader`, `EntryActions`, `CollapsibleItemList`, `AddSectionChooser` |
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

`UI Forms/Guidance` is the high-level decision guide. Every visual form export
must have a colocated story covering its meaningful states.
