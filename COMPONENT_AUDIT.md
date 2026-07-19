# Component audit

Classification for `@stevejuma/ui`. Update this file when components move
between shared and app-specific folders.

## Shared — shadcn (slice 2)

Generic primitives in `src/components/shadcn/`, copied from CV Studio:

accordion, alert, alert-dialog, badge, button, card, collapsible, command,
dialog, dropdown-menu, empty, field, input, input-group, label, popover,
resizable, scroll-area, select, separator, sidebar, skeleton, spinner, switch,
tabs, textarea, toggle, toggle-group, tooltip

Import: `@stevejuma/ui/shadcn/<family>`

## Shared — forms (slice 3)

Config-driven form engine from `@cvstudio/forms` plus field primitives from
`@cvstudio/ui`, under `src/components/forms/`.

Includes form runtime editors `CodeEditor` and `YamlEditor` (required by
`YamlBackedForm`).

Borderline but shared when prop-driven:

- `ReferencePicker`
- `TaskDueCalendar`
- `SearchFilterBar`
- `AddSectionChooser`

## Shared — later

- Markdown stack (`MarkdownEditor`, `MarkdownPreview`, TOC, carta, mermaid)
- `FlipCardDeck`, `StructuredTable*`
- Studio shared controls (`TextControl`, `ListEditor`, option groups)
- AI elements

## App-specific — `src/components/cv/`

Reserved for CV domain UI (workspace hosts, section editors, evidence,
applications kanban hosts, docs hosts, studio shell). Empty in the first wave.

## App-specific — `src/components/beancount/`

Reserved for beancount domain UI (`MerchantPicker`, `AccountAvatar`, filter
semantics, charts/tables/dashboard). Empty in the first wave.
