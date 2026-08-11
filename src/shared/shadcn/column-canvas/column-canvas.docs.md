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
Canvas grows a horizontally scrolling canvas. Wide layouts prioritise the
newest pair with a narrow preceding-column context slice; compact layouts use
one full-stage active column with mandatory snapping.

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

- `wide` gives the newest two rendered columns enough transient minimum width
  to share the stage, while retaining larger controller widths and all resize
  handles. When an older column exists,
  `--ui-column-canvas-wide-context-width` remains visible before the pair.
  The configured trailing spacer, independent vertical body scrolling,
  active-column following, and proximity snapping remain.
- `compact` makes each expanded column fill the complete bounded stage, removes
  the previous-column peek, durable blank tail, and horizontal scrollbar, hides
  resize handles, and snaps columns mandatorily.
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
part of the V1 persistence schema. Compact mode ignores it and retains the
full-stage active-column and snapping behavior.

## Persistence

### Persisted Widths

Inject `ColumnCanvasLayoutPersistence` (or
`createLocalStorageColumnCanvasLayoutPersistence`) to restore widths and
collapse. `onLayoutChange` fires on debounced saves for hosts that sync
elsewhere. `pathLevel` is config, not persisted layout.

## Examples

### Product Workspace Showcase

A realistic workspace → project → board → task cascade with responsive
active-column following, two leading sticky return rails, independent body
scrolling, resizers, collapse controls, five closeable lanes, task progress,
checklist data, and an activity timeline.

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

At compact widths the active column follows the deepest path and fills the
bounded stage without exposing the previous column. At wide widths the newest
pair shares the stage with a narrow slice of preceding context. Durable
controller widths are preserved through both presentations.

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
`--ui-column-canvas-wide-context-width` (defaulting to the retained
`--ui-column-canvas-compact-peek-width` compatibility token, `2.75rem`) and
`--ui-column-canvas-sticky-peek-width` (defaulting to
`--ui-column-canvas-collapsed-width`, `2.75rem`). Production sources use native
CSS and compose the shared Button for Toggle, Close, and sticky return controls.
