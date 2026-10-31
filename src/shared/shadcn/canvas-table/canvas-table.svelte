<script lang="ts">
  import { untrack } from "svelte";
  import { ScrollArea } from "../scroll-area/index.js";
  import type {
    CanvasTableProps,
    CanvasTableRowId,
  } from "./canvas-table-types.js";
  import type { TableContext } from "./canvas-table-context.js";
  import { tableTarget } from "./canvas-table-commands.js";
  import { createTableState } from "./canvas-table-state.svelte.js";
  import { createLayout } from "./canvas-table-layout.js";
  import { createNavigation } from "./canvas-table-navigation.js";
  import { createPointer } from "./canvas-table-pointer.js";
  import { createKeyboard } from "./canvas-table-keyboard.js";
  import { attachScroller } from "./canvas-table-viewport.js";
  import { paintTable } from "./canvas-table-paint.js";
  import { createCanvasTableFiltering } from "./canvas-table-filter-state.svelte.js";
  import Toolbar from "./canvas-table-toolbar.svelte";
  import RowControls from "./canvas-table-row-controls.svelte";
  import RichGrid from "./canvas-table-rich-grid.svelte";
  import { rowSelectionOptions } from "./canvas-table-selection.js";
  import Accessibility from "./canvas-table-accessibility.svelte";
  import Overlays from "./canvas-table-overlays.svelte";
  import Menu from "./canvas-table-menu.svelte";
  import "./canvas-table.css";

  let props: CanvasTableProps = $props();
  const instanceId = $props.id();
  const tableState = createTableState(() => props);
  const measure = $derived.by(() => {
    void tableState.epoch;
    const canvas = tableState.canvas;
    const context = canvas?.getContext("2d");
    if (canvas && context)
      context.font =
        "13px " +
        (canvas.ownerDocument.defaultView?.getComputedStyle(canvas)
          .fontFamily || "monospace");
    return (text: string) =>
      context?.measureText(text).width ?? text.length * 7.8;
  });
  const filtering = createCanvasTableFiltering(() => props);
  const effectiveProps = $derived({ ...props, visibleRowIds: filtering.ids });
  const layout = $derived(
    createLayout(
      effectiveProps,
      tableState.wrap,
      measure,
      tableState.detailHeights,
      tableState.width,
    ),
  );
  const ctx: TableContext = {
    props: () => effectiveProps,
    layout: () => layout,
    state: tableState,
    filterFields: () => filtering.fields,
  };
  const nav = createNavigation(ctx);
  const pointer = createPointer(ctx, nav);
  const keyboard = createKeyboard(ctx, nav);
  const activeDescendant = $derived.by(() => {
    if (!tableState.active || tableTarget(ctx) !== "cell") return undefined;
    const entry = layout.byId.get(tableState.active.rowId);
    return entry
      ? instanceId + "-cell-" + (entry.number - 1) + "-" + tableState.active.col
      : undefined;
  });
  let viewport = $state<HTMLElement | null>(null);
  $effect(() => {
    if (viewport)
      return untrack(() => attachScroller(ctx, viewport as HTMLDivElement));
  });
  function holdCanvas(node: HTMLCanvasElement) {
    tableState.canvas = node;
    return () => {
      if (tableState.canvas === node) tableState.canvas = null;
    };
  }
  function holdGutter(node: HTMLCanvasElement) {
    tableState.gutterCanvas = node;
    return () => {
      if (tableState.gutterCanvas === node) tableState.gutterCanvas = null;
    };
  }
  $effect(() => {
    paintTable(ctx);
  });
  $effect(() => {
    const ids = new Set(props.rows.map((row) => row.id));
    if (props.headerRow ?? true) ids.delete(props.rows[0]?.id ?? "");
    untrack(() => {
      for (const id of tableState.detailHeights.keys())
        if (!ids.has(id)) tableState.detailHeights.delete(id);
    });
    const selected = props.selectedRowIds ?? [];
    const next = [...new Set(selected.filter((id) => ids.has(id)))];
    if (next.length !== selected.length)
      untrack(() => props.onSelectedRowIdsChange?.(next));
  });
  let previousOrder: CanvasTableRowId[] | null = null;
  $effect(() => {
    const next = layout.body.map((entry) => entry.row.id);
    if (
      previousOrder &&
      (previousOrder.length !== next.length ||
        next.some((id, index) => id !== previousOrder?.[index]))
    ) {
      untrack(() => {
        tableState.range = null;
        tableState.target = "cell";
        tableState.drag = null;
      });
    }
    previousOrder = next;
  });
  $effect(() => {
    const cell = tableState.active;
    if (cell && (nav.index(cell) < -1 || cell.col >= layout.widths.length)) {
      tableState.active = null;
      tableState.range = null;
      tableState.editing = false;
    }
  });
</script>

<div
  data-ui-component="canvas-table"
  data-ui-part="root"
  class={["canvas-table", props.class].filter(Boolean).join(" ")}
>
  {#if props.toolbar !== false}
    {#if props.toolbar}
      {@render props.toolbar({
        selectedRowIds: props.selectedRowIds ?? [],
        commitEdit: nav.commitEdit,
      })}
    {:else}<Toolbar {ctx} {nav} />{/if}
  {/if}
  <div class="canvas-table__body">
    <Menu {ctx}>
      <ScrollArea
        class="canvas-table__scroll-area"
        orientation="both"
        bind:viewportRef={viewport}
        scrollbarXClasses="canvas-table__scrollbar"
        scrollbarYClasses="canvas-table__scrollbar"
        viewportProps={{
          class: "canvas-table__scroller",
          role: "grid",
          tabindex: 0,
          "aria-label": props["aria-label"] ?? "Canvas table",
          "aria-rowcount": props.rows.length + (props.columns ? 1 : 0),
          "aria-colcount": layout.widths.length,
          "aria-readonly": !props.onCellChange,
          "aria-activedescendant": activeDescendant,
          "aria-multiselectable": props.rowSelection
            ? rowSelectionOptions(props.rowSelection).mode !== "single"
            : undefined,
          "data-gutter-width": layout.gutter,
          "data-scroll-left": tableState.left,
          "data-scroll-top": tableState.top,
          onpointerdown: pointer.down,
          onpointermove: pointer.move,
          onpointerup: pointer.up,
          onpointercancel: pointer.up,
          onlostpointercapture: () => {
            tableState.drag = null;
          },
          ondblclick: pointer.doubleClick,
          oncontextmenu: pointer.contextMenu,
          onkeydown: keyboard.grid,
        }}
      >
        <div
          class="canvas-table__spacer"
          aria-hidden="true"
          style:width="{layout.width}px"
          style:height="{layout.height}px"
        ></div>
        {#if props.columns}<RichGrid {ctx} {instanceId} />{:else}<Accessibility
            {ctx}
            {instanceId}
          />{/if}
      </ScrollArea>
      <canvas
        class="canvas-table__canvas"
        aria-hidden="true"
        {@attach holdCanvas}
      ></canvas>
      <canvas
        class="canvas-table__frozen-gutter"
        aria-hidden="true"
        {@attach holdGutter}
      ></canvas>
      <RowControls {ctx} />
      <Overlays {ctx} {nav} {keyboard} />
    </Menu>
  </div>
</div>
