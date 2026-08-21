# Column Canvas

Horizontal, selection-driven column cascade for Miller-column / Finder-style
navigation. A typed app-owned controller owns path selection, cascade
visibility (`pathLevel`), durable widths, and collapse/close. `Root` adapts the
canvas presentation to its own bounded width without mutating that controller.
Compound parts provide consistent header, toggle, body, and item chrome.
Adjacent `Item` rows are separated by `--ui-column-canvas-item-gap` so hover
and selected surfaces retain distinct rounded edges.

This is a project-authored native-CSS Layout family. It is not the same as
Resizable: Resizable fills a box with percentage pane groups, while Column
Canvas grows a horizontally scrolling canvas. Wide layouts make the structurally
active column and its immediate right neighbour a shared, bounded pair with a
narrow preceding-column context slice. Starting a resize on another divider
activates that adjacent pair without moving the canvas. Compact layouts use one
full-stage active column with mandatory snapping.

Visibility follows the same split as AppShell: mount every `Column` under
`Root`; the controller decides whether chrome appears. Hosts only map
`path` / `pathAt(level)` to domain data for row content. The full
product-workspace showcase demonstrates a four-level selection path feeding two
detail lanes, with two sticky leading columns and five closeable downstream
columns.

## Import

```ts
import * as ColumnCanvas from "@lapismd/design-core/shadcn/column-canvas";
```

## Usage

```svelte
<script lang="ts">
  import * as ColumnCanvas from "@lapismd/design-core/shadcn/column-canvas";

  const canvas = ColumnCanvas.createColumnCanvasController({
    columns: {
      categories: {
        defaultWidth: 260,
        pathLevel: 0,
        collapsible: true,
        resizable: true,
      },
      components: {
        defaultWidth: 300,
        pathLevel: 1,
        collapsible: true,
        resizable: true,
      },
      detail: {
        defaultWidth: 340,
        pathLevel: 2,
        collapsible: true,
        resizable: true,
        closeable: true,
      },
    },
    initialPath: ["stable-chat", "composer"],
  });
</script>

<div style="height: 460px">
  <ColumnCanvas.Root controller={canvas}>
    <ColumnCanvas.Column id="categories" title="Categories">
      <ColumnCanvas.Body>
        <ColumnCanvas.Item
          selected={canvas.isSelected(0, "stable-chat")}
          onclick={() => canvas.select(0, "stable-chat")}
        >
          Stable Chat
        </ColumnCanvas.Item>
      </ColumnCanvas.Body>
    </ColumnCanvas.Column>

    <ColumnCanvas.Column id="components" title="Components">
      <ColumnCanvas.Body>
        <!-- Consumer-owned list content -->
      </ColumnCanvas.Body>
    </ColumnCanvas.Column>

    <ColumnCanvas.Column id="detail" title="Details">
      <ColumnCanvas.Body>
        <!-- Fields echoed from the selected second-column row -->
      </ColumnCanvas.Body>
    </ColumnCanvas.Column>
  </ColumnCanvas.Root>
</div>
```

## Configure the controller

Create one app-owned controller and pass it to `Root`. The controller owns the
selection path and durable layout state. Keep its reactive fields on the
controller object instead of destructuring them.

### Column configuration

Each entry in `columns` registers one stable column id:

| Option         | Default             | Purpose                                                                |
| -------------- | ------------------- | ---------------------------------------------------------------------- |
| `defaultWidth` | Required            | Initial expanded width in CSS pixels, clamped to the configured limits |
| `minWidth`     | `240`               | Minimum durable width                                                  |
| `maxWidth`     | `760`               | Maximum durable width; set `null` for no upper bound                   |
| `pathLevel`    | `0`                 | Minimum `path.length` required before the column can render            |
| `resizable`    | `false`             | Adds the pointer resize handle outside compact mode                    |
| `collapsible`  | `false`             | Enables `Toggle` and the collapsed rail                                |
| `closeable`    | `false`             | Enables `Close`, `open`, and durable closed state                      |
| `openOnSelect` | Same as `closeable` | Reopens a closed next-level column after selection                     |
| `collapsed`    | `false`             | Initial collapsed state before persistence restores                    |
| `closed`       | `false`             | Initial closed state before persistence restores                       |

`minWidth` must not exceed a finite `maxWidth`. The controller rounds and
clamps every durable width before storing it.

### Controller options

The controller constructor accepts these host integrations:

| Option                | Default  | Purpose                                                             |
| --------------------- | -------- | ------------------------------------------------------------------- |
| `columns`             | Required | Registered column configuration keyed by stable id                  |
| `initialPath`         | `[]`     | Initial Miller-column selection path                                |
| `trailingSpacerWidth` | `0`      | Optional blank width after the final column in wide and fixed modes |
| `persistence`         | None     | Async `load` and `save` adapter for V2 layout state                 |
| `saveDebounceMs`      | `200`    | Delay before layout callbacks and persistence saves                 |
| `onPathChange`        | None     | Receives a copied path after selection changes                      |
| `onLayoutChange`      | None     | Receives the V2 snapshot and its change event before save           |
| `onPersistenceError`  | None     | Receives failed `load` or `save` operations                         |

### Controller state and methods

The public controller surface is grouped by responsibility:

| Area              | State and methods                                                                     |
| ----------------- | ------------------------------------------------------------------------------------- |
| Selection         | `path`, `visibleDepth`, `pathAt`, `select`, `clearFrom`, `clear`, `isSelected`        |
| Visibility        | `getPathLevel`, `isPathVisible`, `isColumnVisible`                                    |
| Registration      | `hasColumn`, `ensureColumn`                                                           |
| Width             | `getWidth`, `getDefaultWidth`, `getMinWidth`, `getMaxWidth`, `setWidth`, `resetWidth` |
| Pair split        | `getPairSplit`, `setPairSplit`, `resetPairSplit`                                      |
| Collapse          | `isCollapsible`, `isCollapsed`, `collapse`, `expand`, `toggle`, `setCollapsed`        |
| Close             | `isCloseable`, `isClosed`, `close`, `open`, `setClosed`                               |
| Resize capability | `isResizable`                                                                         |
| Persistence       | `layoutReady`, `getLayout`, `restoreLayout`, `flushSave`, `dispose`                   |

Selecting the current key clears that level and every deeper level. Closing a
column keeps it registered. Opening a column also leaves its durable width
intact. `ensureColumn(id, config)` supports runtime lanes and applies any
restored snapshot that arrived before registration.

## Compose columns

Passing `title` to `Column` renders the standard `Header`, `Title`, `Count`,
`Toggle`, and `Close` chrome. Omit `title` when you need a custom header and
compose the exported parts yourself. `Body` owns an independent vertical Scroll
Area. Its `onScrollNearEnd` callback fires whenever the body is within 180 CSS
pixels of its bottom.

`Item` is a button that accepts native button attributes. `selected` sets both
`data-selected` and `aria-pressed`; `disabled` retains native button behavior.
The near-end callback can fire again while the body remains near its boundary.
Deduplicate in-flight loading in the host. `Toggle` and `Close` accept shared
Button props and render only when their controller capability is enabled. When
you omit `Column.title`, use readable column ids or override the action labels.

### Column props

`Column` accepts these family-specific props in addition to native section
attributes and a bindable `ref`:

| Prop            | Purpose                                                                |
| --------------- | ---------------------------------------------------------------------- |
| `id`            | Stable controller id                                                   |
| `title`         | Default header title and accessible action label                       |
| `count`         | Default header and collapsed-rail count                                |
| `pathLevel`     | Presentation override for the registered config                        |
| `resizable`     | Presentation override for the registered config                        |
| `collapsible`   | Presentation override for the registered config                        |
| `closeable`     | Presentation override for the registered config                        |
| `sticky`        | Registers a leading floating return rail in wide and fixed modes       |
| `stickyRail`    | Named snippet rendered inside the sticky return button                 |
| `width`         | Test or harness width override; prefer controller widths in products   |
| `onWidthChange` | Test or harness resize callback; prefer controller updates in products |

`CollapsedColumn` is a low-level escape hatch with `label`, optional `count`,
and `onExpand`. It must remain inside `Root`. Prefer controller-owned collapse
through `Column` for durable application layout.

### Compound context hooks

Use `useColumnCanvas()` inside a custom descendant to read the controller.
`useColumnCanvasContext()` also exposes the resolved display mode, layout
request functions, and `activateResizePair()` for compound extensions that own
a resize gesture. `useColumnCanvasColumn()` reads the current column id, title,
count, and capability flags inside `Column`. Do not destructure reactive
context getters.

## Responsive display

`Root` defaults to `displayMode="auto"`. A `ResizeObserver` resolves the root to
`wide` at or above `compactBreakpoint` (`960` CSS pixels by default), or
`compact` below it. Inspect the resolved presentation through
`data-display-mode="wide|compact|fixed"`.

### Root props

| Prop                | Default           | Purpose                                                       |
| ------------------- | ----------------- | ------------------------------------------------------------- |
| `controller`        | Required          | App-owned `ColumnCanvasController`                            |
| `displayMode`       | `"auto"`          | Requested `auto`, `compact`, or `fixed` presentation          |
| `compactBreakpoint` | `960`             | Bounded root width that separates auto compact and wide modes |
| `tabindex`          | `0`               | Keeps root-level compact keyboard navigation reachable        |
| `role`              | `"region"`        | Root landmark role                                            |
| `aria-label`        | `"Column canvas"` | Accessible landmark name                                      |
| `ref`               | `null`            | Bindable root element reference                               |
| `children`          | None              | Column parts rendered in track order                          |

`Root` also forwards native div attributes and event handlers. An `onkeydown`
or `onwheel` handler can call `preventDefault()` before the built-in routing
logic runs.

- `wide` gives the structurally active column and its immediate right neighbour the
  available stage after padding, gaps, collapsed rails, and the existing
  preceding-context allowance. Their configured widths establish the initial
  ratio; minimum and maximum bounds redistribute space, `maxWidth: null`
  permits unbounded fill, minimum overflow remains scrollable, and finite
  maximum slack remains explicit. Two expanded resizable members expose one
  keyboard-accessible shared divider: growing one shrinks the other by the same
  amount. The right member's outer handle is suppressed.
- `compact` makes each expanded column fill the complete bounded stage, removes
  the previous-column peek, durable blank tail, and horizontal scrollbar, hides
  resize handles, and snaps columns mandatorily.
- `displayMode="fixed"` is the compatibility escape hatch: controller widths,
  resize handles, an optional configured trailing spacer, and free horizontal
  scrolling remain as in the original canvas, with no active-column following.

Set `displayMode="compact"` to force the compact presentation at every root
width. Set `displayMode="fixed"` to bypass container adaptation. In auto mode,
`compactBreakpoint` uses the bounded root width rather than the viewport.

Structural navigation initially activates the deepest adjacent pair. Starting
a pointer, keyboard, or reset interaction on any other eligible divider
activates its adjacent expanded pair and reallocates that stage without moving
the canvas. The shared divider changes both widths inversely. Manual horizontal
scrolling alone preserves the current allocation and native position. Collapsed
rails are skipped as pair members; their widths, margins, and intervening gaps
are deducted before the next expanded column is paired. Collapse or close
temporarily reallocates available space; reopening restores the pair's saved
split. Root-level Arrow Left/Right
and Home/End navigate compact snap points without changing controller
selection. A scrollable body retains vertical wheel ownership while it can
move. At its boundary, or over a non-scrollable body, vertical input routes to
slower, smooth compact-canvas motion. Input at the canvas edge remains available
to the surrounding page. Reduced-motion preferences keep routed motion instant.

## Sticky columns

Add `sticky` to consecutive leading `Column` parts to register floating
collapsed replacements. The source columns stay full-width in normal flow and
retain their durable geometry; they do not use CSS sticky positioning. When a
source moves underneath its rail-width slot, `Root` overlays an opaque collapsed
rail while the source and later columns keep moving with native horizontal
motion.

Use the named `stickyRail` snippet for consumer-owned return-button contents.
`Root` composes a circular outlined shadcn `Button`, keeps the visible column
label beneath it, and provides the return action, so clicking it scrolls back to
the source column without selecting, expanding, or otherwise mutating
controller state. The default button uses the standard back arrow.

Sticky behavior resolves only in `wide` and `fixed` modes. Expanded columns
use `--ui-column-canvas-sticky-peek-width` (the collapsed-column `2.75rem`
width by default) for the floating rail, while a collapsed source uses its
complete collapsed width.
Active rails form one gapless, opaque stack flush with the root's inline and
block edges, ignoring its content padding. A sticky request after a rendered
non-sticky column does not activate.
`data-sticky="true"` reflects the request, source columns expose
`data-sticky-state="flowing|stuck"`, and replacements expose
`data-sticky-for` for diagnostics and styling. Source body scrollbars and
independent vertical scrolling remain unchanged. Otherwise-unused vertical
wheel input over a non-scrollable body moves a wide/fixed sticky canvas
horizontally with continuous scaled motion; scrollable bodies retain priority,
and input at a canvas edge is left to the surrounding page.

Sticky is transient presentation state. It is not controller configuration or
part of the V2 persistence schema. Compact mode ignores it and retains the
full-stage active-column and snapping behavior.

## Persist layout

`Root` calls `restoreLayout()` and exposes restoration through
`controller.layoutReady` and `data-layout-ready`. A persistence adapter loads
unknown data and saves the normalized V2 shape:

```json
{
  "version": 2,
  "columns": {
    "tasks": { "width": 380, "collapsed": false, "closed": false }
  },
  "pairSplits": [
    {
      "leadingColumnId": "tasks",
      "trailingColumnId": "detail",
      "leadingFraction": 0.42
    }
  ]
}
```

V2 persists each registered column's width, collapsed state, and closed state,
plus validated ratios for independent directed adjacent pairs. V1 snapshots
migrate with no pair ratios. Invalid versions and malformed entries are
ignored. Temporary collapse stretching and container-size scaling are never
persisted.

Use `createLocalStorageColumnCanvasLayoutPersistence(key, storage?)` for browser
storage, or implement `ColumnCanvasLayoutPersistence` for another backend.
Call `flushSave()` before a host must observe pending changes. Call `dispose()`
when the owning application lifecycle ends.

`onLayoutChange` receives a `source` of `collapse`, `close`, `resize`,
`resize-pair`, `reset-pair`, `reset-width`, `register`, or `ensure`, plus the
affected `columnId`; pair events also carry `relatedColumnId`.
`onPersistenceError` reports `load` and `save` failures without replacing app
error policy.

The selection path, `pathLevel`, responsive mode, sticky state, and scroll
position are transient. They never enter the V2 layout schema.

## Accessibility and input

`Root` defaults to a focusable `region` named “Column canvas”. Supply a
domain-specific `aria-label` when a page contains more than one canvas. Native
HTML attributes and event handlers pass through every visual part.

When compact `Root` itself has focus, Arrow Left, Arrow Right, Home, and End
move between snap points without changing controller selection or descendant
focus. Horizontal wheel, trackpad, and touch movement remain native. Vertical
wheel motion stays with the nearest scrollable body while it can move. Unused
vertical motion moves an eligible horizontal canvas, and motion at the canvas
edge remains available to the surrounding page.

Toggle, Close, collapsed rails, resize separators, and sticky return buttons
ship with accessible names. Routed scrolling uses instant motion when the
reader requests reduced motion. Logical inline-axis geometry supports
left-to-right and right-to-left documents.

## Examples

### Product workspace showcase

A realistic workspace → project → board → task cascade with responsive
active-column following, two leading sticky return rails, independent body
scrolling, resizers, collapse controls, five closeable lanes, task progress,
checklist data, and an activity timeline.

### All features

Three always-mounted columns with collapse, resize, and a closeable details
pane that repeats Name / Id / Role / Import / Category from the selected
component.

### Three-level cascade

Path selection only: categories → components → detail prose.

### Closeable

`Close` removes a closeable column from the canvas; `controller.open(id)` or
selecting a row (`openOnSelect`) restores it.

### Collapse and expand

`Toggle` collapses a column to a vertical rail; expand restores it.

### Resizable columns

Set `resizable: true` on adjacent columns. In wide mode every eligible divider
activates its adjacent expanded pair when used, then resizes both members
inversely without moving the canvas. Fixed mode retains independent trailing
handles.

### Responsive adaptive canvas

At compact widths the active column follows the deepest path and fills the
bounded stage without exposing the previous column. At wide widths the newest
pair shares the stage with the full outer slot of preceding context, including
consumer margins, so a sticky overlay does not obstruct it. Pair ratios scale
with the container, survive collapse/expand, and remain independent as
navigation or an explicit resize activates another pair.

### Fixed compatibility

Set `displayMode="fixed"` when a host must retain fixed pixel widths and free
horizontal scrolling at every container size.

### Sticky floating columns

Mark consecutive leading main panels `sticky` and provide `stickyRail` snippets
so later detail columns can move past ordinary-flow sources while custom
collapsed replacements remain available as return controls.

### Sticky fixed columns

Fixed mode supports the same opt-in floating replacements without enabling
active following or snapping. Fixed canvases without sticky columns are
unchanged.

## Parts

The family exports these visual parts:

| Part              | Responsibility                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `Root`            | Controller context, bounded responsive horizontal track, input routing, following, and sticky stack |
| `Column`          | Visibility, durable width, collapse/close state, default header, and resize handle                  |
| `Header`          | Custom fixed header container inside `Column`                                                       |
| `Title`           | Custom title that falls back to the column context title                                            |
| `Count`           | Custom count that hides when neither content nor a count exists                                     |
| `HeaderActions`   | Action group for custom header controls                                                             |
| `Toggle`          | Controller-owned collapse and expand button                                                         |
| `Close`           | Controller-owned close button                                                                       |
| `Body`            | Independent vertical Scroll Area and near-end callback                                              |
| `Item`            | Selectable native button row                                                                        |
| `CollapsedColumn` | Low-level manually controlled rail                                                                  |

The barrel also exports the controller, persistence types and helpers, display
mode types, context hooks, constants, and `columnCanvasTokenNames`.

The complete non-visual export groups are:

- Controller: `createColumnCanvasController`, `ColumnCanvasController`,
  `ColumnCanvasColumnConfig`, `CreateColumnCanvasControllerOptions`, and the
  `COLUMN_CANVAS_DEFAULT_MIN_WIDTH`, `COLUMN_CANVAS_DEFAULT_MAX_WIDTH`, and
  `COLUMN_CANVAS_DEFAULT_TRAILING_SPACER_WIDTH` constants
- Allocation: `allocateColumnCanvasPair`, `allocateColumnCanvasWidth`, and
  their bound/allocation types
- Persistence: `createLocalStorageColumnCanvasLayoutPersistence`,
  `normalizeColumnCanvasLayout`, `ColumnCanvasLayoutV1`,
  `ColumnCanvasLayoutV2`, `COLUMN_CANVAS_LAYOUT_VERSION`,
  `COLUMN_CANVAS_DEFAULT_STORAGE_KEY`, and all layout, adapter, event, source,
  and error types
- Presentation: `ColumnCanvasDisplayMode`,
  `ColumnCanvasResolvedDisplayMode`, the three context hooks and their context
  types, `columnCanvasTokenNames`, and `ColumnCanvasToken`

Each visual part also has a long alias, such as `ColumnCanvasColumn` and
`ColumnCanvasBody`. `ColumnCanvas` is the alias for `Root`.

## Diagnostic attributes

Use semantic attributes for tests and supported ancestor styling:

| Element            | Attributes                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Root               | `data-display-mode` with `wide`, `compact`, or `fixed`; `data-layout-ready`                                                       |
| Column             | `data-column-id`, `data-resizable`, `data-responsive-stage`, `data-responsive-stage-position`, `data-sticky`, `data-sticky-state` |
| Resize handle      | `data-resize-mode` with `pair` or `column`; `data-resizing`                                                                       |
| Sticky replacement | `data-sticky-for`, `data-sticky-state="stuck"`                                                                                    |
| Item               | `data-selected` and `aria-pressed`                                                                                                |
| Every family part  | `data-ui-component="column-canvas"` and a semantic `data-ui-part`                                                                 |

## Styling

Override these public tokens on `:root` or a shared ancestor:

| Token                                               | Default                                         |
| --------------------------------------------------- | ----------------------------------------------- |
| `--ui-column-canvas-background`                     | `--background`                                  |
| `--ui-column-canvas-column-background`              | `--card`                                        |
| `--ui-column-canvas-border-color`                   | `--border`                                      |
| `--ui-column-canvas-radius`                         | `--radius-lg`, then `--radius`                  |
| `--ui-column-canvas-header-height`                  | `2.5rem`                                        |
| `--ui-column-canvas-gap`                            | `0.75rem`                                       |
| `--ui-column-canvas-collapsed-width`                | `2.75rem`                                       |
| `--ui-column-canvas-compact-peek-width`             | `2.75rem` compatibility token                   |
| `--ui-column-canvas-wide-context-width`             | `--ui-column-canvas-compact-peek-width`         |
| `--ui-column-canvas-sticky-peek-width`              | `--ui-column-canvas-collapsed-width`            |
| `--ui-column-canvas-resize-handle-hover`            | 40% `--primary` mixed with transparent          |
| `--ui-column-canvas-title-color`                    | `--foreground`                                  |
| `--ui-column-canvas-count-color`                    | `--muted-foreground`                            |
| `--ui-column-canvas-header-action-hover`            | 12% `--foreground` mixed with column background |
| `--ui-column-canvas-header-action-hover-foreground` | `--foreground`                                  |
| `--ui-column-canvas-padding`                        | `0.75rem`                                       |
| `--ui-column-canvas-scrollbar-gap`                  | `0.5rem`                                        |
| `--ui-column-canvas-item-gap`                       | `0.25rem`                                       |
| `--ui-column-canvas-item-hover`                     | `--muted`                                       |
| `--ui-column-canvas-rail-hover`                     | `--muted`                                       |
| `--ui-column-canvas-item-selected`                  | `--accent`                                      |
| `--ui-column-canvas-item-selected-foreground`       | `--accent-foreground`                           |

Production sources use native CSS. Toggle, Close, and sticky return controls
compose the shared shadcn Button.
