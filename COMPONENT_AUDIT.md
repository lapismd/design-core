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

| Status    | Families                                                                                                                                                                                                                                                                                |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Converted | accordion, alert, alert-dialog, badge, button, card, collapsible, command, dialog, sheet, dropdown-menu, empty, field, input, input-group, label, popover, resizable, scroll-area, select, separator, sidebar, skeleton, spinner, switch, tabs, textarea, toggle, toggle-group, tooltip |

Batch commands: `pnpm ui:add:batch a` (simple roots), `b` (stateful/light compound),
`c` (portals), `d` (layout/field compounds). Inspect: `pnpm ui:inspect <name>`.

## Shared — forms

Config-driven form engine and field primitives in `src/shared/forms/<family>/`:

**Engine** (`structured-form/`, `core/`): `StructuredForm`, `FormFieldRenderer`,
`FormViewRenderer`, `YamlBackedForm`, `JsonBackedForm`, `PatchableForm`,
`builders` / `types` / `registry` / `core` / `json-patch` / `patch-review` /
`review-diff`

**Primitives** (one kebab-case folder each): `form-field`,
`form-section-header`, `form-toolbar`, `form-add-button`, `form-sheet`,
`entry-actions`, `collapsible-item-list`, `add-section-chooser`,
`segmented-control`, `inline-option-picker`, `autocomplete-input`,
`chip-autocomplete`, `list-editor`, `sortable-array-item`, `secret-field`,
`filter-command-picker`, `date-picker`,
`reference-picker`, `task-due-calendar`, `form-review`

Removed as duplicates of shadcn / thin aliases: `choice-menu` (use Select),
`tag-editor` (use `ChipAutocomplete`), `searchable-choice-picker` (use
`FilterCommandPicker`), `read-only-form` (use `FormField` `readonly` /
`ReferencePicker` preview).

**Runtime editors:** `code-editor`, `code-highlighter`, `yaml-editor`

**Patch review:** `PatchableForm` orchestrates Keep/Undo over structured fields
and YAML hunks; `form-review/` provides `UnifiedReviewDiff`,
`FieldReviewActions`, and reviewed field renderers (`ReviewedTextFormField`,
`ReviewedStringListFormField`) built on `FormField` / `ListEditor`.

Borderline but shared when prop-driven: `ReferencePicker`, `TaskDueCalendar`,
`DatePicker`, `FilterCommandPicker`, `AddSectionChooser`

Import: `@stevejuma/ui/forms` and `@stevejuma/ui/forms/core`

## Shared — filter

Search chrome and Fava-inspired filter-query language in `src/shared/filter/`:

- `SearchFilterBar` — plain or `filter-query` CodeMirror mode + host
  `filterSyntax` autocomplete
- `filter-query/` — Lezer grammar, `parseFilterQuery`, `filterQuery()` language
  support

Import: `@stevejuma/ui/filter`. Catalog: `Filter/...`. Guidance: `Filter/Guidance`.
Forms may compose the bar; do not re-export it from `@stevejuma/ui/forms`.

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

## Reference — Tasks (`packages/tasks`)

Fixture-driven white-label Tasks UI: controlled components and page
compositions under `packages/tasks/src/{components,pages}`, plus contracts,
synthetic fixtures, motion helpers, and a scoped `.tasks-theme` companion.

**Implemented families:** TaskRow, TaskComposer, TaskProperties, TasksFeedback,
TaskList, ListNavigation, TasksFilters, TaskDetail, TasksShell,
TasksSwipeGesture, and page compositions (Shell through Task detail).

**Host reuse:** Button, Badge, Field, Input, Textarea, Popover, Select,
DropdownMenu, ToggleGroup, ScrollArea, Collapsible, Separator, Empty, Skeleton,
Spinner, Alert, and forms `TaskDueCalendar`.

**Still blocked on `pnpm ui:add`:** `checkbox`, `avatar`, `context-menu`
(generator fails repo-wide svelte-check). TaskRow ships an accessible
`role="checkbox"` completion control until the host Checkbox family lands.

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
