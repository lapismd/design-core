# Component audit

Classification for `@stevejuma/ui`. Update this file when components move
between shared and app-specific folders.

## Shared — shadcn

Generic primitives in `src/shared/shadcn/`, copied from CV Studio:

accordion, alert, alert-dialog, badge, button, card, collapsible, command,
dialog, dropdown-menu, empty, field, input, input-group, label, popover,
resizable, scroll-area, select, separator, sidebar, skeleton, spinner, switch,
tabs, textarea, toggle, toggle-group, tooltip

Import: `@stevejuma/ui/shadcn/<family>`

## Shared — forms

Config-driven form engine and field primitives in `src/shared/forms/<family>/`:

**Engine** (`structured-form/`, `core/`): `StructuredForm`, `FormFieldRenderer`,
`FormViewRenderer`, `YamlBackedForm`, `builders` / `types` / `registry` /
`core`

**Primitives** (one kebab-case folder each): `form-field`,
`form-section-header`, `entry-actions`, `collapsible-item-list`,
`add-section-chooser`, `segmented-control`, `choice-menu`,
`inline-option-picker`, `searchable-choice-picker`, `autocomplete-input`,
`chip-autocomplete`, `tag-editor`, `read-only-form`, `search-filter-bar`,
`reference-picker`, `task-due-calendar`

**Runtime editors:** `code-editor`, `yaml-editor`

Borderline but shared when prop-driven: `ReferencePicker`, `TaskDueCalendar`,
`SearchFilterBar`, `AddSectionChooser`

Import: `@stevejuma/ui/forms` and `@stevejuma/ui/forms/core`

## Shared — later

- Markdown stack (`MarkdownEditor`, `MarkdownPreview`, TOC, carta, mermaid)
- `FlipCardDeck`, `StructuredTable*`
- Studio shared controls (`TextControl`, `ListEditor`, option groups)
- AI elements

## App-specific — `src/apps/cv/`

Reserved for CV domain UI (workspace hosts, section editors, evidence,
applications kanban hosts, docs hosts, studio shell). Empty placeholder barrel
only.

## App-specific — `src/apps/beancount/`

Reserved for beancount domain UI (`MerchantPicker`, `AccountAvatar`, filter
semantics, charts/tables/dashboard). Empty placeholder barrel only.
