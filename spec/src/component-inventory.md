# Component inventory

This canonical inventory classifies reusable `@lapismd/design-core` components
by their owning public layer.

## Public surface coverage

| Surface                  | Public boundary | Requirement |
| ------------------------ | --------------- | ----------- |
| Component classification | Architecture    | DC-ARCH-007 |

## DC-ARCH-007 — Component classification

**Requirement.** Every reusable Design Core component MUST be classified under
exactly one owning shared layer before it becomes a public export.

### Acceptance details

- The inventory must identify the owning source family and public import boundary for each implemented shared layer.
- New visual exports must update this inventory in the same protected change.
- Historical implementation research may support a classification but must not become a second normative source.

## Shared — shadcn

Generic primitives in `src/shared/shadcn/`:

accordion, alert, alert-dialog, badge, button, card, code, code-block,
collapsible, column-canvas, command, dialog, dropdown-menu, empty, field,
input, input-group, label, hover-card, popover, resizable, scroll-area, select, separator,
sheet, sidebar, skeleton, spinner, switch, swipe-item, tabs, textarea, toggle,
toggle-group, tooltip, progress, slider, context-menu, drawer

Import: `@lapismd/design-core/shadcn/<family>`

Registry-backed families are converted to scoped native CSS with token maps and
provenance files through `pnpm ui:add` / `pnpm ui:add:batch`. `swipe-item` is a
project-authored native-CSS family because no corresponding registry item
exists; its contract and research provenance live in
[`spec/records/swipe-item.md`](../records/swipe-item.md).
`column-canvas` is a project-authored Layout family for selection-driven
horizontal column cascades (Miller-column style) with an AppShell-like
controller, compound Header/Toggle/Body/Item parts, and injected width/collapse
persistence; it is not registry-backed.
`code` and `code-block` are project-authored Astryx-inspired content primitives;
see [`spec/records/code-and-code-block.md`](../records/code-and-code-block.md).
Prefer them for inline/fenced presentation. Forms
`code-highlighter` remains the Lezer/`parser`-driven form-preview path.

Batch commands: `pnpm ui:add:batch a` (simple roots), `b`
(stateful/light compound), `c` (portals), and `d` (layout/field compounds).
Inspect a family with `pnpm ui:inspect <name>`.

## Shared — forms

Config-driven form engine and field primitives in
`src/shared/forms/<family>/`.

**Engine** (`structured-form/`, `yaml-backed-form/`, `json-backed-form/`,
`core/`): `StructuredForm`, `FormFieldRenderer`, `FormViewRenderer`,
`YamlBackedForm`, `JsonBackedForm`, `PatchableForm`, builders, types, registry,
typed path configurations, form controllers, JSON Patch, and review-diff
utilities. Renderer registries are explicit per-form instances; the package
does not expose mutable global renderer registration.

**Primitives:** `form-field`, `form-section-header`, `form-toolbar`,
`form-add-button`, `form-sheet`, `entry-actions`, `collapsible-item-list`,
`add-section-chooser`, `segmented-control`, `inline-option-picker`,
`color-picker`, `cycle-picker`, `autocomplete-input`, `chip-autocomplete`, `list-editor`,
`sortable-array-item`, `secret-field`, `filter-command-picker`,
`date-picker`, `time-picker`, `reference-picker`, `task-due-calendar`,
`form-review`, `unified-review-diff`, and `field-review-actions`.

Removed duplicate/thin aliases:

- `choice-menu` — use Select.
- `tag-editor` — use `ChipAutocomplete`.
- `searchable-choice-picker` — use `FilterCommandPicker`.
- `read-only-form` — use readonly `FormField` or `ReferencePicker`.

**Runtime editors:** `code-editor`, `code-highlighter`, `yaml-editor`.
`CodeEditor` and `YamlEditor` are Design Core domain wrappers over
`@lapismd/mira`'s `MiraCodeEditor`; Mira owns CodeMirror mounting, lifecycle,
base chrome, sizing, gutters, and scrolling. Design Core owns languages,
diagnostics, YAML folding/formatting, review decorations, and form-token
mappings. `code-highlighter` remains the read-only Lezer preview path.

**Patch review:** `PatchableForm` orchestrates Keep/Undo over structured fields
and YAML hunks. `form-review/` provides `UnifiedReviewDiff`,
`FieldReviewActions`, and reviewed field renderers built on `FormField` and
`ListEditor`.

Borderline but shared when prop-driven: `ReferencePicker`,
`TaskDueCalendar`, `DatePicker`, `FilterCommandPicker`, and
`AddSectionChooser`.

Import: `@lapismd/design-core/forms` and `@lapismd/design-core/forms/core`

## Shared — filter

Search chrome and structured filter-query language in `src/shared/filter/`:

- `PowerSearch` — field/operator/value tokens and a field combobox.
- `SearchFilterBar` — plain or `filter-query` CodeMirror mode plus
  host-supplied `filterSyntax` autocomplete. This compact/searchbox lifecycle is
  intentionally deferred from the Mira shell migration.
- `filter-query/` — Lezer grammar, `parseFilterQuery`, and `filterQuery()`
  language support.

Import: `@lapismd/design-core/filter`. Catalog: `Filter/...`. Guidance:
`Filter/Guidance`. Forms may compose the bar; do not re-export it from the
forms barrel.

## Shared — AI

Presentational AI chat primitives in `src/shared/ai/<component>/`, with no
network or host-store dependency. Storybook: `AI/...`.

- One folder per stable component (layout, composer, message, …) — 15
  ASTRYX-inspired message/layout, composer, token, dictation, and tool-call
  primitives. Stable imports use `@lapismd/design-core/ai/chat`.
- `experimental/<component>/` — five Lab-derived reasoning, reaction, emoji,
  typing, and unread primitives. Every export is marked `@experimental`;
  import from `@lapismd/design-core/ai/experimental`.

Import: `@lapismd/design-core/ai`, `@lapismd/design-core/ai/chat`, and
`@lapismd/design-core/ai/experimental`.

## Shared — Diff

Change-set listing, file comparison, and merge presentation in
`src/shared/diff/<family>/`. Hosts own VCS, file bytes, and persistence.

- `FileListing` — list, folder tree, and compacted package tree for a change set
- `FileChangeStats` — added and removed line counts with distinct tones
- `FileDiff` — unified or split textual diffs with collapsed context
- `MergeEditor` — one-way or three-way merge blocks, optional editable overlay, and host-triggered actions
- `core/` — headless tree, row, and merge models

Import: `@lapismd/design-core/diff`. Catalog: `Diff/...`. Guidance:
`Diff/Guidance`. Forms `UnifiedReviewDiff` remains the short field-value review
surface. Workspace Explorer remains vault filesystem chrome.

## Shared — shell

Bounded application chrome in `src/shared/shell/app-shell/` (layer root holds
guidance, tokens, and the package barrel):

- Compound `Root`, `Sidebar`, `Sidebar.Header`, `Sidebar.Body`,
  `Sidebar.Footer`, `Sidebar.Toggle`, `Sidebar.Close`, `Main`, `Toolbar`, and
  `Body`, `Body.Content`, `Body.Sidebar`, and `Body.Toggle` surfaces
- Viewport-height root with overrideable structural geometry tokens
- Independent reactive left and right expanded/collapsed/closed and width
  controllers
- Optional standalone sidebar controllers for repeated same-side layouts
- Full-height outer sidebar variant with an opt-in collapsed/closed edge preview
- Opt-in delayed toggle-hover preview for a collapsed or closed sidebar
- Accessible pointer and keyboard resize handles baked into expanded sidebars
- Versioned built-in/named panel layout persistence with an injected adapter
  and default localStorage implementation
- Container-aware single-composition desktop/mobile presentation with a
  transient left/main/right stage controller
- Default auto mode plus constrained-desktop overlay fallback that protects a
  public minimum main width without changing durable sidebar layout
- Workspace-inspired horizontal gestures, inert offstage lanes, focus
  restoration, and shadcn Select panel switching when an edge has multiple
  registered panels
- Fixed chrome around shadcn Scroll Areas in main, body-local, and outer
  sidebar regions
- Body-local corner toggles composed from the shadcn icon Button
- Consumer-owned navigation, actions, content, and non-layout persistence

Import: `@lapismd/design-core/shell`. Catalog: `Shell/App Shell`. Production Shell
sources use native CSS and `--ui-shell-*` geometry tokens. They compose the
generic shadcn Scroll Area, Button, and Select primitives and do not import
application-specific state; catalog examples compose other shadcn controls to
demonstrate consumer ownership.

Choose Shell for structural application chrome. Choose Workspace when an
application needs registered views, tabs, splits, commands, full workspace
persistence, plugins, settings, windows, or general-purpose overlays.

## Shared — workspace

Application-independent workspace framework in `src/shared/workspace/`.

- Headless controller, recursive layout, registered views, settings, commands,
  static plugins, events, and persistence adapters
- Compound desktop/mobile app-shell surfaces, including a reusable desktop
  grid for bottom-panel alignment across workspace columns
- Tabs, splits, sidebars, transposed bottom-panel groups, view headers, drop
  targets, windows, ribbon, status, settings, command palette, empty and notice
  components, with structured live view badges shared across every leaf label
- Explorer panel (`Workspace/Panels/Explorer`): controller-driven file/folder
  chrome with consumer-owned tree/action adapters (filesystem stays outside
  the framework)
- Problems panel (`Workspace/Panels/Problems`): generic diagnostic collections,
  filtering, grouped-tree and compact-table views, actions, and a movable
  presentation plugin with a live owning-leaf count badge plus consumer-owned
  resource navigation and quick-fix adapters
- Startup surface (`Workspace/Components/Startup`): application-independent
  task progress and bounded failure presentation with host-owned actions
- Optional F-Mode and Notifications plugins

Import: `@lapismd/design-core/workspace`. Production Workspace sources use
native CSS, direct headless primitives, selected repository-owned shadcn
families, and `--ui-workspace-*` tokens. They do not import upstream shadcn or
Tailwind class infrastructure. Migration progress and component classification
are tracked in `src/shared/workspace/PLAN.md`.

## Shared — later

- Markdown stack: editor, preview, TOC, Carta, Mermaid.
- `FlipCardDeck` and `StructuredTable*`.
