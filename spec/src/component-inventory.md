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

`file-type-icon/` owns filename-based Material file icons, exported through
`@lapismd/design-core/shadcn/file-type-icon` (DC-SHA-064). Diff File Listing
composes it without changing folder icons, row geometry or host-owned state.

accordion, alert, alert-dialog, badge, button, card, code, code-block,
collapsible, column-canvas, command, command-view, dialog, dropdown-menu, emoji-picker, empty, field, panel-toggle,
input, input-group, label, hover-card, popover, resizable, scroll-area, select, separator,
sheet, sidebar, skeleton, spinner, switch, swipe-item, tabs, textarea, toggle,
toggle-group, tooltip, progress, slider, context-menu, drawer

`tag-list` is a project-authored Data Display family composing existing Badge
and Button chips with measured overflow, Tooltip, Popover and ScrollArea. Only
TagList and its item/props types are public; its chip renderer stays private.
Import it from `@lapismd/design-core/shadcn/tag-list`.

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
Prefer `PanelToggleIcon` for sidebar visibility icons, `PanelToggle` for a standalone controlled button, and the existing Workspace/AppShell toggle when controller integration is needed.

`panel-toggle` is a project-authored Layout family composing the public Button
with a shared standard or compact panel icon. It accepts controlled expanded
state, left/right/top/bottom orientation and custom content, and supplies Column
Canvas's default compact toggle and collapsed-rail icon. The decorative
`PanelToggleIcon` also composes inside existing controls. It is not a registry
conversion.
`command-view` is a project-authored Forms family for a host-agnostic searchable
command surface with composable input and item parts. It composes bits-ui
Command keyboard behavior and the public ScrollArea viewport. It is not
registry-backed and MUST NOT export dialog, popover, or overlay chrome.
`code` and `code-block` are project-authored Astryx-inspired content primitives;
see [`spec/records/code-and-code-block.md`](../records/code-and-code-block.md).
Prefer them for inline/fenced presentation. Forms
`code-highlighter` remains the Lezer/`parser`-driven form-preview path.

Workspace Settings owns the reusable `CopyableValue` controlled-output
presentation under `workspace/settings`; it is not a second shadcn family.

`emoji-picker` is a project-authored native-CSS family composing Popover and
Button with lazy-loaded Emoji Mart Unicode search, categories and skin tones,
suggested reactions, custom image emoji and a restricted searchable grid.
The AI experimental entry point is a compatibility export of this family.

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
`sortable-array-item`, `secret-field`, `password-input`, `filter-command-picker`,
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
- `experimental/<component>/` — five Lab-derived reasoning, reaction, emoji compatibility,
  typing, and unread primitives. Every export is marked `@experimental`;
  import from `@lapismd/design-core/ai/experimental`.

- `content-view-toggle/` owns the shared icon-only formatted/source control (DC-AI-027), used by tool detail and host inspectors; `/chat` re-exports it.
- `tool-call-detail/` owns generic and rich tool details: formatted/raw shell, file read, file edit and search presentation. `/chat` re-exports this family. Provider adapters remain host-owned.

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
  `Body`, `Body.Content`, `Body.Sidebar`, `Body.Toggle`, `SurfaceLayer`,
  `SurfaceLayer.Header`, and `SurfaceLayer.Body` surfaces
- Viewport-height root with overrideable structural geometry tokens
- Independent reactive left and right expanded/collapsed/closed and width
  controllers
- Optional standalone sidebar controllers for arbitrary repeated same-side
  layouts, deterministic constraint priority, per-panel preview or main-surface
  replacement, and transient suspension
- Headerless transparent `rail` sidebars aligned to the inset main surface
- One controller-owned structural SurfaceLayer per root with covered-panel
  geometry, scrim/Escape dismissal, focus return, inert restoration, and
  logical-direction layout
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
- Optional F-Mode and Notifications plugins; the shared controlled NotificationToasts presenter also accepts host-owned records, actions and lifecycle callbacks without a workspace controller

Import: `@lapismd/design-core/workspace`. Production Workspace sources use
native CSS, direct headless primitives, selected repository-owned shadcn
families, and `--ui-workspace-*` tokens. They do not import upstream shadcn or
Tailwind class infrastructure. Migration progress and component classification
are tracked in `src/shared/workspace/PLAN.md`.

## Shared — later

- Markdown stack: editor, preview, TOC, Carta, Mermaid.
- `FlipCardDeck` and `StructuredTable*`.

## Shared dialog compositions

- `DialogFrame`: application-independent modal layout with controlled root, sidebar, scroll body, and stationary footer.
- `ConfirmDialog` and `ConfirmButton`: compact asynchronous confirmation and trigger composition.

Import these through `@lapismd/design-core/forms`; domain-specific controls remain in consumers.

## App component promotion batch

Responsive Tabs and Avatar are shared Shadcn primitives. Avatar Picker is a
Forms input. AppShell.Topbar extends the Shell compound family. Chat owns
MarkdownContent and re-exports existing stable AI chat primitives without moving
their implementations. These additions retain host-owned storage and adapters.

MarkdownComposer, MessageActions and Reactions are shared Chat presentation
families: Mira owns Markdown editing, the existing Composer owns shell anatomy,
and hosts own drafts, delivery, action policy and reaction persistence.

CommentComposer is shared Chat presentation for compact inline drafts and
captured-source reply cards. Hosts own comment IDs, anchors, queues and delivery.

Transcript, HistoryEdge and CommentQueue are shared Chat presentation. The optional
TranscriptController is owned by the host so state survives presentation teardown;
it coordinates exact anchors and snapshots but never executes or persists work.

TranscriptFooter and MessageQueue are parts of the Transcript family. They present
host-owned send/stop intent and queued submission data, without runtime or durable
queue policy. ComposerStatusBanner is part of the existing Composer family and
shares its attached status presentation with transcript comments.

PromptContext is shared Chat presentation for XML-style ACP/prompt context. Its
Mira preview extension never resolves application entities or executes context.

SentContext is shared Chat presentation for the compact sent/prepared/queued/failed/
unknown application-context disclosure. It composes PromptContext and raw CodeBlock
inside shared ScrollArea, independently or before Transcript message content.
Hosts normalize payload schemas and receipts; captured context never implies delivery.

## Community presentation additions

AvatarGroup extends the existing Shadcn Avatar family. AuthorCard, ReferenceChip,
LinkPreview, Spoiler and RelativeTime are project-authored Shadcn families with
component-owned native CSS and host-owned display data. QuantityInput is a Forms
input with exact unit conversion. MarkdownComposer trigger suggestions extend
the existing Chat family; ThreadPanel adds nested human discussion presentation.
These families contain no Community identities, repository models or transport.

FilePathInput is a shared Forms primitive adapted from JJ Store, with optional
host-owned file selection and no filesystem authority. Workspace Settings may
compose it and QuantityInput as first-party declarative inputs.
