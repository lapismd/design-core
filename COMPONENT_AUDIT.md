# Component audit

Classification for the reusable `@lapismd/design-core` package. Update this file when
components move between shared layers.

## Shared — shadcn

Generic primitives in `src/shared/shadcn/`:

accordion, alert, alert-dialog, badge, button, card, code, code-block,
collapsible, command, dialog, dropdown-menu, empty, field, input, input-group,
label, popover, resizable, scroll-area, select, separator, sheet, sidebar,
skeleton, spinner, switch, swipe-item, tabs, textarea, toggle, toggle-group,
tooltip, progress, slider, context-menu, drawer

Import: `@lapismd/design-core/shadcn/<family>`

Registry-backed families are converted to scoped native CSS with token maps and
provenance files through `pnpm ui:add` / `pnpm ui:add:batch`. `swipe-item` is a
project-authored native-CSS family because no corresponding registry item
exists; its contract and research provenance live in `ADD_SWIPE_ITEM.md`.
`code` and `code-block` are project-authored Astryx-inspired content primitives;
see `ADD_CODE_BLOCK.md`. Prefer them for inline/fenced presentation. Forms
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
JSON Patch, and review-diff utilities.

**Primitives:** `form-field`, `form-section-header`, `form-toolbar`,
`form-add-button`, `form-sheet`, `entry-actions`, `collapsible-item-list`,
`add-section-chooser`, `segmented-control`, `inline-option-picker`,
`autocomplete-input`, `chip-autocomplete`, `list-editor`,
`sortable-array-item`, `secret-field`, `filter-command-picker`,
`date-picker`, `time-picker`, `reference-picker`, `task-due-calendar`,
`form-review`, `unified-review-diff`, and `field-review-actions`.

Removed duplicate/thin aliases:

- `choice-menu` — use Select.
- `tag-editor` — use `ChipAutocomplete`.
- `searchable-choice-picker` — use `FilterCommandPicker`.
- `read-only-form` — use readonly `FormField` or `ReferencePicker`.

**Runtime editors:** `code-editor`, `code-highlighter`, `yaml-editor`.

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
  host-supplied `filterSyntax` autocomplete.
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
- Compound desktop/mobile app-shell surfaces
- Tabs, splits, sidebars, sidebar groups, view headers, drop targets, windows,
  ribbon, status, settings, command palette, empty and notice components
- Optional F-Mode and Notifications plugins

Import: `@lapismd/design-core/workspace`. Production Workspace sources use native CSS,
direct headless primitives, and `--ui-workspace-*` tokens. They do not import
the shadcn layer or Tailwind class infrastructure. Migration progress and
component classification are tracked in `src/shared/workspace/PLAN.md`.

## Shared — later

- Markdown stack: editor, preview, TOC, Carta, Mermaid.
- `FlipCardDeck` and `StructuredTable*`.
