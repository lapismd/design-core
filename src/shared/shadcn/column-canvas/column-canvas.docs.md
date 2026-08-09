# Column Canvas

Horizontal, selection-driven column cascade for Miller-column / Finder-style
navigation. A typed app-owned controller owns path selection, widths, and
collapse. Compound parts provide consistent header, toggle, body, and item
chrome.

This is a project-authored native-CSS Layout family. It is not the same as
Resizable: Resizable fills a box with percentage pane groups, while Column
Canvas grows a horizontally scrolling canvas of fixed-width columns.

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
      categories: { defaultWidth: 260, collapsible: true, resizable: true },
      components: { defaultWidth: 300, collapsible: true, resizable: true },
      detail: {
        defaultWidth: 340,
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

    {#if canvas.path[0]}
      <ColumnCanvas.Column id="components" title="Components">
        <ColumnCanvas.Body>
          <!-- Consumer-owned list content -->
        </ColumnCanvas.Body>
      </ColumnCanvas.Column>
    {/if}

    {#if canvas.path[1]}
      <ColumnCanvas.Column id="detail" title="Details">
        <ColumnCanvas.Body>
          <!-- Fields echoed from the selected second-column row -->
        </ColumnCanvas.Body>
      </ColumnCanvas.Column>
    {/if}
  </ColumnCanvas.Root>
</div>
```

## Controller

`createColumnCanvasController` owns:

- Path: `path`, `select`, `clearFrom`, `clear`, `isSelected`, `visibleDepth`
- Layout: `getWidth` / `setWidth` / `resetWidth`, `collapse` / `expand` /
  `toggle`, `close` / `open`, `isCollapsed`, `isClosed`, `isResizable`,
  `isCollapsible`, `isCloseable`
- Dynamic columns: `ensureColumn(id, config)`
- Persistence: `restoreLayout`, `flushSave`, `getLayout`, `dispose`

## Persistence

### Persisted Widths

Inject `ColumnCanvasLayoutPersistence` (or
`createLocalStorageColumnCanvasLayoutPersistence`) to restore widths and
collapse. `onLayoutChange` fires on debounced saves for hosts that sync
elsewhere.

## Examples

### All Features

Three-column cascade with collapse, resize, and a closeable details pane that
repeats Name / Id / Role / Import / Category from the selected component.

### Three Level

Path selection only — categories → components → detail prose.

### Closeable

`Close` removes a closeable column from the canvas; `controller.open(id)`
restores it.

### Collapse And Expand

`Toggle` collapses a column to a vertical rail; expand restores it.

### Resizable

Set `resizable: true` on the column config — the handle updates the controller.

## Styling

Override the public `--ui-column-canvas-*` tokens on an ancestor. Production
sources use native CSS and compose the shared Button for Toggle and Close.
