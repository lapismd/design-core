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

- `PowerSearch` — structured field/operator/value tokens + field combobox (no
  CodeMirror); shared predicate editor with `SearchFilterBar`
- `SearchFilterBar` — plain or `filter-query` CodeMirror mode + host
  `filterSyntax` autocomplete
- `filter-query/` — Lezer grammar, `parseFilterQuery`, `filterQuery()` language
  support

Import: `@stevejuma/ui/filter`. Catalog: `Filter/...`. Guidance: `Filter/Guidance`.
Forms may compose the bar; do not re-export it from `@stevejuma/ui/forms`.

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
- `CvSectionsForm` — profile, social networks, roles, dynamic sections
- Entry editors — `GenericEntryEditor`, `ExperienceEditor`, `EducationEditor`
- Tabs — Evidence, Design, Locale, Settings
- Controls — `TextControl`, `ColorControl`, `SwitchControl`, `OptionButtonGroup`
- `CvFormOverview` — thin back-compat wrapper around `CvWorkspaceForm`

## App-specific — `src/apps/beancount/`

Beancount Studio domain composition for Storybook / app reuse
(`@stevejuma/ui/apps/beancount`), migrated from `beancount-js-studio`'s
`@beancount-js/ui` package. Props/callbacks only — no filesystem, routing, or
persistence in these components.

**Layout (`layout/`)** — `Apps/Beancount/Layout/*`:

- `AppShell` (+ `AppShellDemo` story fixture) — the application frame; slots
  for sidebar, header actions/leading/trailing, status, and AI rail
- `ContentScrollArea` — bounded scroll viewport wrapping shadcn Scroll Area
- `ResizableSidebar` — controlled pointer/keyboard sidebar resize rail
- `StudioShellHeader` — project identity header for a Studio sidebar
- `StudioWorkspaceShell` — full reusable frame composing `AppShell`,
  shadcn `Sidebar`, `StudioShellHeader`, and `ProjectSwitcher`

**Navigation (`navigation/`)** — `Apps/Beancount/Navigation/*`:

- `AccountNavigationLink` — uses `AccountAvatar` from the colocated
  `pickers/` module (see below); not re-exported from `navigation/` to avoid a
  duplicate export
- `CycleSelect` — previous/next cycling wrapper around forms
  `FilterCommandPicker`
- `LedgerWorkspaceNavigation` — ledgers/folders/tags composition over
  `WorkspaceTreeNavigation`, forms `FilterCommandPicker`, and `SegmentedControl`
- `PagePagination` — wraps shadcn `Pagination`
- `ProjectSwitcher`, `SavedQueryHistory`, `SidebarNavigation`,
  `WorkspaceTreeNavigation`

**Host reuse:** shadcn `button`, `input`, `scroll-area`, `sidebar`, `separator`,
`accordion`, `tooltip`, `pagination`; forms `FilterCommandPicker`,
`SegmentedControl`; `pickers` `AccountAvatar`. Icons use `@lucide/svelte`
(studio source used `lucide-svelte`; rewritten on migration).

**Feedback (`feedback/`)** — `Apps/Beancount/Feedback/*`:

Loading, empty, and error surfaces migrated from the studio's
`components/feedback/`:

- `AccountsPageSkeleton`, `AiDockSkeleton`, `BrandSettingsSkeleton`,
  `MerchantsPageSkeleton`, `QueryPageSkeleton`, `ReconciliationReviewSkeleton`,
  `ReviewImportsSkeleton`, `RulesPageSkeleton`, `SourcesPageSkeleton` — route-
  and surface-specific loading compositions built on shadcn `Skeleton`, kept
  narrow to their target layout rather than a generic placeholder
- `RouteLoadingSkeleton` — route-boundary skeleton that selects
  `QueryPageSkeleton` for the query route; converted from the source's Svelte
  4 `export let` / `$:` syntax to Svelte 5 `$props()` / `$derived` on migration
- `ResourceViewerSkeleton` — minimal skeleton reused by `ResourcePreview`
- `ResourcePreview` (+ `ResourcePreviewItem` type) — display-model workspace
  resource preview (image/PDF/text) over shadcn `Button` and `ScrollArea`;
  applications resolve/revoke URLs and load text
- `ValidationErrorTable` (+ `ValidationErrorRow` type) — actionable ledger
  validation table over shadcn `Table`, with a calm empty state

**Host reuse (feedback):** shadcn `skeleton`, `table`, `button`, `scroll-area`.
Icons use `@lucide/svelte` (studio source used `lucide-svelte`; rewritten on
migration). Props and callbacks only — no filesystem, ledger, or route access.

**Pickers (`pickers/`)** — `Apps/Beancount/Pickers/*`:

Domain-specific selection and appearance-editing controls migrated from the
studio's `components/forms/` (these are Beancount domain pickers, not generic
form primitives, so they live outside `@stevejuma/ui/forms`):

- `AccountAvatar` (+ colocated `account-appearance-icons` /
  `account-avatar` / `appearance-color` helpers) — moved here from
  `navigation/` (the earlier migration pass placed it there; it is a picker
  concern shared by `AccountNavigationLink`, `IconColorPicker`, and
  `AccountPicker`/`MerchantPicker` call sites, so it now has a single home)
  and its display fallback/appearance logic
- `AccountPicker` — data-driven account selector; thin adapter over forms
  `FilterCommandPicker`
- `MerchantPicker` (+ `MerchantPickerMerchant` / `MerchantPickerEmptyOption`
  types) — data-driven saved-merchant selector with an optional
  application-owned "create from search" action; thin adapter over forms
  `FilterCommandPicker`
- `IconColorPicker` — the account-appearance editor (colour swatches + a
  searchable icon grid) with icon-contrast protection; its icon search is a
  local weighted-field ranker (same scoring approach as forms'
  `filterCommandOptions`) over the colocated `account-appearance-icons`
  options — the source studio version depended on `@beancount-js/filters`'
  Fuse-backed `fuzzySearch`, which is not a dependency of this package and was
  not added; no `fuse.js`/`@beancount-js/filters` dependency was introduced

**Host reuse (pickers):** shadcn `scroll-area`; forms `FilterCommandPicker`
and its `FilterCommandOption`/`FilterCommandSearchAction` types; `bits-ui`
`Popover`. Icons use `@lucide/svelte` (studio source used `lucide-svelte`;
rewritten on migration). The studio's `picker-options.ts`/`picker-search.ts`
helpers were **not** copied: `FilterCommandOption`, `FilterCommandSearchAction`,
and `filterCommandOptions` already exist (and were already reimplemented
without Fuse) under `@stevejuma/ui/forms`, so `MerchantPicker`/`AccountPicker`
import them directly instead of duplicating a second copy.

**Known gaps from the source studio version** (destination shadcn primitives
don't yet support these — cosmetic only, not blocking):

- `Sidebar.Root`'s `showBorder` prop doesn't exist on the catalog's `sidebar`
  family; dropped from `StudioWorkspaceShell`.
- `Accordion.Trigger`'s `indicatorPosition` prop doesn't exist on the catalog's
  `accordion` family; dropped from `SavedQueryHistory` (chevron always
  trails instead of leading).
- `buttonVariants()` is a deprecated no-op (returns `""`) in this catalog's
  `button` family, so `SidebarNavigation`'s anchor-as-button styling relies
  only on the extra classes layered on top — matches the same pattern already
  used in the catalog's own Tooltip preview example.

**Charts (`charts/`)** — `Apps/Beancount/Charts/*`:

- `BarChart` — responsive grouped or diverging-stacked bar chart (single vs
  stacked account/category series), with budget marker support
- `ChartLegend` — interactive series legend (multi- or single-selection
  `ToggleGroup`) for hiding or focusing chart series
- `ChartModeSwitch` — controlled tab list for a chart's alternate visual
  representations (e.g. line vs area)
- `ChartPanel` — controlled toolbar/frame combining legend, compact-display
  selects, and mode switch around a model-driven chart `children` snippet
- `ChartSwitcher` — responsive, controlled perspective selector for related
  charts, with horizontal-overflow tab strip
- `HierarchyChart` — model-driven allocation chart with treemap and sunburst
  views
- `LineChart` — responsive time-series renderer (line or area) with
  accessible point focus
- `ScatterPlot` — model-driven ledger-event plot with accessible point focus

**Dashboard (`dashboard/`)** — `Apps/Beancount/Dashboard/*`:

- `FinancialDashboard` — the canonical financial-dashboard page composition:
  period/currency/valuation controls, summary metrics, cash flow, outflows,
  balance sheet, and net-worth sections
- `DashboardSection` — controlled disclosure card wrapping a dashboard insight
- `DashboardFlow` (+ colocated `dashboard-flow.ts` balancing/layout helpers
  and spec) — cash-flow Sankey-style renderer with keyboard-explorable streams
- `DashboardDonut` — model-driven category donut with centre feedback
- `DashboardLine` — keyboard-explorable trend line/area with pointer and
  keyboard exploration
- `DashboardTreeTable` (+ colocated `DashboardTreeRow` and
  `dashboard-tree-table.ts` contribution/collapse helpers and spec) —
  expandable account summary with contribution legend and weight meters
- `DashboardChartTooltip` — shared positioned tooltip used by `DashboardFlow`
  and `DashboardLine`

**Host reuse (charts/dashboard):** shadcn `toggle-group`, `tabs`, `select`,
`scroll-area`; forms `SegmentedControl`; `d3-scale` and `d3-shape` (added as
direct dependencies for `DashboardLine`'s scales/generators). Icons use
`@lucide/svelte` (studio source used `lucide-svelte`; rewritten on migration).
No filesystem, ledger, or route access — props and callbacks only.

**Tables (`tables/`)** — `Apps/Beancount/Tables/*`:

- `AccountBulkActionSheet` — presentational bulk-action sheet for selected
  ledger records (account replacement + duplicate deletion), built on forms
  `FilterCommandPicker`, `FormField`, `FormSectionHeader`
- `AccountTreeTable` — controlled-data account hierarchy with per-column
  values and accessible row disclosure
- `DataTable` (+ colocated `data-table-adapter.svelte.ts`,
  `data-table-flex-render.svelte`, `data-table-render-helpers.ts` TanStack
  Table Svelte adapter — the shadcn-svelte "data-table" recipe is unsupported
  by this catalog's `ui:add` pipeline, so the generic adapter is colocated
  here instead of under `shared/shadcn/`) — typed TanStack Table composition
  for fixed-column collections
- `ImportMappingTable` — controlled, presentation-only import mapping table
  with categorized/uncategorized tabs over forms `FilterCommandPicker`
- `IngestionReviewTable` — model-driven queue for grouped import proposals
  with selection, disclosure, forms `SegmentedControl` filters, and a
  callback-only Fava Records no-imports panel
- `IngestionReviewToolbar` — controlled Fava Records header actions; the host
  owns review-ledger routing, acceptance, source selection, group state, AI,
  and source configuration operations
- `HoldingsTable` — controlled Fava-style holdings display, with account
  avatars, locally sortable display columns, and `PagePagination`
- `IntervalTreeTable` — display-model-driven multi-period account comparison
  with budget variance and an `accountCell` snippet slot
- `LedgerActivityTable` — model-driven ledger activity surface with grouping,
  Fava-style date-group/record card hierarchy, separate balance-description
  and summary-disclosure controls, persistent record cards, selection,
  posting account identities, forms `SegmentedControl` timeframes,
  host-controlled pagination/page sizes, and cross-page selection scope
- `QueryResultsTable` — formatted, client-sortable query result table wrapping
  `PagePagination`
- `StatementSummaryTreeRow` (+ `StatementSummaryTreeTable`) — financial
  statement hierarchy with contribution bar/legend, weight meters, and
  multi-currency values

**Host reuse (tables):** shadcn `table`, `alert`, `alert-dialog`, `button`,
`select`, `sheet`, `tabs`, `tooltip`; forms `FilterCommandPicker`, `FormField`,
`FormSectionHeader`, `SegmentedControl`; navigation `PagePagination`;
`@tanstack/table-core` (added as a direct dependency for `DataTable`'s
adapter). Icons use `@lucide/svelte` (studio source used `lucide-svelte`;
rewritten on migration).

`MerchantPicker` is implemented under `pickers/` (see above). Still reserved:
filter semantics.

**Sources (`sources/`)** — `Apps/Beancount/Sources/*`:

- `SourceConnectionCatalog` — controlled connected/available bank-source cards
  and expanded display-only setup, credential, account, and update details;
  host-owned callbacks retain all sync, source configuration, secret, and
  routing state
- `SourceAccountGroups` — controlled source-account and unassigned-account
  rows with display-only expanded linked-account groups and host-owned
  disclosure, account, and setup callbacks
- `ImportAccountsToolbar` — controlled Fava Import Accounts Sync all request
- `SourceToolbar` — controlled Sync all, YAML mode, edit, and history requests;
  the host owns each operation and source state

**Rules (`rules/`)** — `Apps/Beancount/Rules/*`:

- `RuleList` — controlled sortable rule collection, active-state requests, and
  display-ready run history; host owns ordering, rule persistence, action
  menus, and navigation
- `RulesToolbar` — controlled Fava Rules apply-all and add-rule header requests

### Screens + Fava capture harness

**Screens (`screens/`)** — `Apps/Beancount/Screens/*`:

Full-viewport compositions (1280×900) for aligning catalog UI against live Fava
captures. Tagged `fava-reference-visual` + `skip-visual` until bodies are
honest enough for Playwright regression. Visual Delta reads the same PNGs the
capture harness writes.

- `EditorToolbar` — controlled Fava-aligned collapse/expand headings and save
  header actions; the host owns the editor runtime, File/Edit menus, persistence,
  and CodeMirror integration
- `LedgerEditorSurface` — display-ready, tokenized Fava ledger source preview;
  the host owns parsing, source edits, selections, persistence, and CodeMirror

**Harness** (`scripts/beancount-screens/`):

- `FAVA_SCREEN_CAPTURE=1 pnpm beancount:screens:capture` starts local Fava
  (via `BEANCOUNT_JS_STUDIO_ROOT`) and writes PNGs directly to
  `tests/visual/storybook.spec.ts-snapshots/apps/beancount/screens/`.
- `pnpm beancount:screens:verify` checks matrix ↔ stories ↔ baseline files.
- Do **not** refresh these with `test:visual:update`.

### Fava leftovers (keep in `packages/fava` for now)

After migrating `@beancount-js/ui` into `@stevejuma/ui/apps/beancount`, these
Fava surfaces remain app-coupled (router, stores, `useContext`, ingestion APIs,
Codemirror, or ledger/core types). Do **not** move them until a clear
props/callbacks boundary exists. Prefer thin Fava adapters that map domain
data into the display models already exported from `apps/beancount`.

**Already covered by renamed catalog components** (Fava should rewire later):

| Fava / local name                                    | Catalog target                      |
| ---------------------------------------------------- | ----------------------------------- |
| `ActivityTable` / journal activity chrome            | `LedgerActivityTable`               |
| `TreeTable` / `TreeTableNode`                        | `AccountTreeTable`                  |
| `IntervalTreeTable` (thin wrapper)                   | `IntervalTreeTable`                 |
| `QueryTable`                                         | `QueryResultsTable`                 |
| `ModeSwitch`                                         | `ChartModeSwitch`                   |
| `HierarchyContainer` / treemap+sunburst              | `HierarchyChart`                    |
| `StudioShell` (partial)                              | `AppShell` / `StudioWorkspaceShell` |
| `ContentScrollArea`, `PagePagination`, `CycleSelect` | same names under layout/navigation  |
| Dashboard widgets                                    | `FinancialDashboard` + `Dashboard*` |
| Page skeletons / `ResourcePreview`                   | `feedback/*`                        |
| `MerchantPicker` / `AccountLink` avatar              | `pickers/*`                         |

**Keep in Fava — route / workspace adapters:**

- Shell: `StudioShell`, `StudioShellHeader` (Fava-wired), `Nav`, `FavaNavigation`,
  `Search`, `Main` layout
- Reports: `AccountDetails`, `BalanceSheet`, `IncomeStatement`, `TrialBalance`,
  `StatementReport`, `Holdings`, `Statistics`, `PresetQueryView`
- Journal / query: `JournalTable`, `AccountActivityTable`, `Query`, `QueryBox`,
  `Editor`, Codemirror widgets (`Highlighter`, find/replace, etc.)
- Ingestion / rules: `Ingestion*`, `MerchantEditSheet`, `LocalMerchantMatchPicker`,
  `RulesSettings`, `RuleEditorSheet`, `RuleConditionRow`, `AiDock`,
  `AiUnifiedReviewDiff`, `JournalEditorSheet`, `JournalRecordRouteSheet`
- Form field adapters tied to `@beancount-js/forms` registry:
  `AccountComboField`, `MerchantComboField`, `SecretField`, `SwitchField`
- Low-level tree parts still used by Fava wrappers: `AccountCell`,
  `AccountCellHeader`, `Diff`, `Errors`

**Follow-up (`fava-beta` only):** after the Plan's component, visual, and
integration gates are met, clone a clean Fava revision into `packages/fava-beta`
and point its presentation adapters at `@stevejuma/ui/apps/beancount` (+ host
shadcn/forms/filter). Keep `packages/fava` unchanged and runnable as the
side-by-side reference; do not rewire or delete it.
