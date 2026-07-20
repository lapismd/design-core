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

**Native CSS conversion** (scoped CSS + `<family>.tokens.ts` + `<family>.provenance.json`
via `pnpm ui:add` / `pnpm ui:add:batch`):

| Status    | Families                                                                                                                                                                                                                                                                         |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Converted | accordion, alert, alert-dialog, badge, button, card, collapsible, command, dialog, dropdown-menu, empty, field, input, input-group, label, popover, resizable, scroll-area, select, separator, sidebar, skeleton, spinner, switch, tabs, textarea, toggle, toggle-group, tooltip |

Batch commands: `pnpm ui:add:batch a` (simple roots), `b` (stateful/light compound),
`c` (portals), `d` (layout/field compounds). Inspect: `pnpm ui:inspect <name>`.

## Shared — forms

Config-driven form engine and field primitives in `src/shared/forms/<family>/`:

**Engine** (`structured-form/`, `core/`): `StructuredForm`, `FormFieldRenderer`,
`FormViewRenderer`, `YamlBackedForm`, `builders` / `types` / `registry` /
`core`

**Primitives** (one kebab-case folder each): `form-field`,
`form-section-header`, `entry-actions`, `collapsible-item-list`,
`add-section-chooser`, `segmented-control`, `inline-option-picker`,
`autocomplete-input`, `chip-autocomplete`, `list-editor`,
`sortable-array-item`, `read-only-form`, `search-filter-bar`,
`reference-picker`, `task-due-calendar`

Removed as duplicates of shadcn / thin aliases: `choice-menu` (use Select),
`tag-editor` (use `ChipAutocomplete`), `searchable-choice-picker` (use
Command + Popover).

**Runtime editors:** `code-editor`, `yaml-editor`

Borderline but shared when prop-driven: `ReferencePicker`, `TaskDueCalendar`,
`SearchFilterBar`, `AddSectionChooser`

Import: `@stevejuma/ui/forms` and `@stevejuma/ui/forms/core`

## Shared — workspace-shell

Prop-driven three-region Studio chrome in `src/shared/workspace-shell/`:

- `StudioWorkspaceShell` — `Sidebar.Provider` host with `sidebar` / `main` / `ai` snippets
- `StudioSidebar` — left nav chrome (tabs, collapse, resize, workspace mode switcher)
- AI padding CSS via `data-ai-sidebar` on the sidebar provider

Import: `@stevejuma/ui/workspace-shell`

## Shared — AI

Presentational AI chat chrome in `src/shared/ai/` (no fetch / no Studio store).
Storybook: **AI/** (Overview + per-component stories). Built on shadcn
`Button`, `Textarea`, `ScrollArea`.

- `AiChatDock` — placement / visibility; sets `data-ai-sidebar`
- `AiChatTranscript` — message list (+ optional review summary)
- `AiPromptInput` — composer + `onSend`
- `AiChatPanelSettings` — placement / collapse controls
- `AiChatPanel` — composes dock + transcript + prompt

Import: `@stevejuma/ui/ai`

## Shared — later

- Markdown stack (`MarkdownEditor`, `MarkdownPreview`, TOC, carta, mermaid)
- `FlipCardDeck`, `StructuredTable*`

## App-specific — `src/apps/cv/`

CV domain composition for Storybook / app reuse (`@stevejuma/ui/apps/cv`):

- `CvWorkspaceForm` — five-tab form + YAML mode (form-only story `Apps/CV/CV Form`)
- `CvWorkspaceBody` / `CvEditorToolbar` — main body host + toolbar (undo/redo stubs, collapse, YAML)
- `CvWorkspaceSidebar` — CV file list + create/import controls (props / fixtures)
- Flagship shell story — `Apps/CV/CV Workspace` (shell + sidebar + form + AI fixtures)
- `CvSectionsForm` — profile, social networks, roles, dynamic sections
- Entry editors — `GenericEntryEditor`, `ExperienceEditor`, `EducationEditor`
- Tabs — Evidence, Design, Locale, Settings
- Controls — `TextControl`, `ColorControl`, `SwitchControl`, `OptionButtonGroup`
- `CvFormOverview` — thin back-compat wrapper around `CvWorkspaceForm`

## App-specific — `src/apps/beancount/`

Reserved for beancount domain UI (`MerchantPicker`, `AccountAvatar`, filter
semantics, charts/tables/dashboard). Empty placeholder barrel only.
