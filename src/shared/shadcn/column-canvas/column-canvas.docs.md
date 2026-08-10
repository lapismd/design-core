# Column Canvas

Horizontal, selection-driven column cascade for Miller-column / Finder-style
navigation. A typed app-owned controller owns path selection, cascade
visibility (`pathLevel`), durable widths, and collapse/close. `Root` adapts the
canvas presentation to its own bounded width without mutating that controller.
Compound parts provide consistent header, toggle, body, and item chrome.

This is a project-authored native-CSS Layout family. It is not the same as
Resizable: Resizable fills a box with percentage pane groups, while Column
Canvas grows a horizontally scrolling canvas. Wide layouts use durable
fixed-width columns; compact layouts use stage-width columns with a previous
column peek and mandatory snapping.

Visibility follows the same split as AppShell: mount every `Column` under
`Root`; the controller decides whether chrome appears. Hosts only map
`path` / `pathAt(level)` to domain data for row content.

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

## Controller

`createColumnCanvasController` owns:

- Path: `path`, `pathAt`, `select`, `clearFrom`, `clear`, `isSelected`,
  `visibleDepth`
- Cascade visibility: `pathLevel` on column config, `getPathLevel`,
  `isPathVisible`, `isColumnVisible` (path-eligible and not closed)
- Layout: `getWidth` / `setWidth` / `resetWidth`, `collapse` / `expand` /
  `toggle`, `close` / `open`, `isCollapsed`, `isClosed`, `isResizable`,
  `isCollapsible`, `isCloseable`
- Closeable QoL: `openOnSelect` (default true when `closeable`) reopens the
  next-level closeable column on `select`
- Dynamic columns: `ensureColumn(id, config)`
- Persistence: `restoreLayout`, `flushSave`, `getLayout`, `dispose`

## Responsive display

`Root` defaults to `displayMode="auto"`. A `ResizeObserver` resolves the root to
`wide` at or above `compactBreakpoint` (`960` CSS pixels by default), or
`compact` below it. Inspect the resolved presentation through
`data-display-mode="wide|compact|fixed"`.

- `wide` retains controller pixel widths, resize handles, the configured
  trailing spacer, independent vertical body scrolling, active-column
  following, and proximity snapping.
- `compact` makes each expanded column one stage wide, exposes
  `--ui-column-canvas-compact-peek-width` of the previous column, removes the
  durable blank tail and horizontal scrollbar, hides resize handles, and snaps
  columns mandatorily. Scrollbars are suppressed on preceding context columns
  so the peek does not read as another scroll surface.
- `displayMode="fixed"` is the compatibility escape hatch: controller widths,
  resize handles, trailing spacer, and free horizontal scrolling remain as in
  the original canvas, with no active-column following.

The last rendered, non-closed column is the active column. It is followed after
path, visibility, collapse/open, restoration, and display-mode changes—not
after ordinary body rendering or manual scrolling. Root-level Arrow Left/Right
and Home/End navigate compact snap points without changing controller
selection. A scrollable body retains vertical wheel ownership while it can
move. At its boundary—or over a non-scrollable body—vertical input routes to
slower, smooth compact-canvas motion. Input at the canvas edge remains available
to the surrounding page. Reduced-motion preferences keep routed motion instant.

## Sticky columns

Add `sticky` to consecutive leading `Column` parts to register floating
collapsed replacements. The source columns stay full-width in normal flow and
retain their durable geometry; they do not use CSS sticky positioning. When a
source moves underneath its rail-width slot, `Root` overlays an opaque collapsed
rail while the source and later columns keep moving with native horizontal
motion.

Use the named `stickyRail` snippet for consumer-owned rail contents. `Root`
provides the accessible button and return action, so clicking the rail scrolls
back to the source column without selecting, expanding, or otherwise mutating
controller state. The default rail renders the column title and count.

Sticky behavior resolves only in `wide` and `fixed` modes. Expanded columns
use `--ui-column-canvas-sticky-peek-width` (`4.75rem` by default) for the
floating rail, while a collapsed source uses its complete collapsed width.
Active rails form one gapless, opaque stack at the root inline start. A sticky
request after a rendered non-sticky column does not activate.
`data-sticky="true"` reflects the request, source columns expose
`data-sticky-state="flowing|stuck"`, and replacements expose
`data-sticky-for` for diagnostics and styling. Source body scrollbars and
independent vertical scrolling remain unchanged.

Sticky is transient presentation state. It is not controller configuration or
part of the V1 persistence schema. Compact mode ignores it and retains the
existing stage-width peek and snapping behavior.

## Persistence

### Persisted Widths

Inject `ColumnCanvasLayoutPersistence` (or
`createLocalStorageColumnCanvasLayoutPersistence`) to restore widths and
collapse. `onLayoutChange` fires on debounced saves for hosts that sync
elsewhere. `pathLevel` is config, not persisted layout.

## Examples

### All Features

Three always-mounted columns with collapse, resize, and a closeable details
pane that repeats Name / Id / Role / Import / Category from the selected
component.

### Three Level

Path selection only — categories → components → detail prose.

### Closeable

`Close` removes a closeable column from the canvas; `controller.open(id)` or
selecting a row (`openOnSelect`) restores it.

### Collapse And Expand

`Toggle` collapses a column to a vertical rail; expand restores it.

### Resizable

Set `resizable: true` on the column config — the handle updates the controller.

### Responsive Adaptive Canvas

At a bounded 700px width the active column follows the deepest path, the
previous column remains available as context, and durable controller widths are
preserved for the next wide layout.

### Fixed Compatibility

Set `displayMode="fixed"` when a host must retain fixed pixel widths and free
horizontal scrolling at every container size.

### Sticky Floating Columns

Mark consecutive leading main panels `sticky` and provide `stickyRail` snippets
so later detail columns can move past ordinary-flow sources while custom
collapsed replacements remain available as return controls.

### Sticky Fixed Columns

Fixed mode supports the same opt-in floating replacements without enabling
active following or snapping. Fixed canvases without sticky columns are
unchanged.

## Styling

Override the public `--ui-column-canvas-*` tokens on an ancestor, including
`--ui-column-canvas-compact-peek-width` (default `2.75rem`) and
`--ui-column-canvas-sticky-peek-width` (default `4.75rem`). Production sources
use native CSS and compose the shared Button for Toggle and Close.
