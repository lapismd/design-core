<script lang="ts">
  import { untrack } from "svelte";
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
  import Accessibility from "./canvas-table-accessibility.svelte";
  import Overlays from "./canvas-table-overlays.svelte";
  import Menu from "./canvas-table-menu.svelte";
  import "./canvas-table.css";

  let props: CanvasTableProps = $props();
  const instanceId = $props.id();
  const state = createTableState();
  const measure = $derived.by(() => {
    void state.epoch;
    const canvas = state.canvas;
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
  const layout = $derived(createLayout(effectiveProps, state.wrap, measure));
  const ctx: TableContext = {
    props: () => effectiveProps,
    layout: () => layout,
    state,
    filterFields: () => filtering.fields,
  };
  const nav = createNavigation(ctx);
  const pointer = createPointer(ctx, nav);
  const keyboard = createKeyboard(ctx, nav);
  const activeDescendant = $derived.by(() => {
    if (!state.active || tableTarget(ctx) !== "cell") return undefined;
    const entry = layout.byId.get(state.active.rowId);
    return entry
      ? instanceId + "-cell-" + (entry.number - 1) + "-" + state.active.col
      : undefined;
  });
  function holdScroller(node: HTMLDivElement) {
    return attachScroller(ctx, node);
  }
  function holdCanvas(node: HTMLCanvasElement) {
    state.canvas = node;
    return () => {
      if (state.canvas === node) state.canvas = null;
    };
  }
  $effect(() => {
    paintTable(ctx);
  });
  $effect(() => {
    const ids = new Set(props.rows.map((row) => row.id));
    if (props.headerRow ?? true) ids.delete(props.rows[0]?.id ?? "");
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
        state.range = null;
        state.target = "cell";
        state.drag = null;
      });
    }
    previousOrder = next;
  });
  $effect(() => {
    const cell = state.active;
    if (cell && (nav.index(cell) < -1 || cell.col >= layout.widths.length)) {
      state.active = null;
      state.range = null;
      state.editing = false;
    }
  });
</script>

<div
  data-ui-component="canvas-table"
  data-ui-part="root"
  class={["canvas-table", props.class].filter(Boolean).join(" ")}
>
  <Toolbar {ctx} {nav} />
  <div class="canvas-table__body">
    <Menu {ctx}>
      <div
        class="canvas-table__scroller"
        role="grid"
        tabindex="0"
        aria-label={props["aria-label"] ?? "Canvas table"}
        aria-rowcount={props.rows.length}
        aria-colcount={layout.widths.length}
        aria-readonly={!props.onCellChange}
        aria-activedescendant={activeDescendant}
        aria-multiselectable={props.rowSelection || undefined}
        data-gutter-width={layout.gutter}
        data-scroll-left={state.left}
        data-scroll-top={state.top}
        {@attach holdScroller}
        onpointerdown={pointer.down}
        onpointermove={pointer.move}
        onpointerup={pointer.up}
        onpointercancel={pointer.up}
        onlostpointercapture={() => {
          state.drag = null;
        }}
        ondblclick={pointer.doubleClick}
        oncontextmenu={pointer.contextMenu}
        onkeydown={keyboard.grid}
      >
        <div
          class="canvas-table__spacer"
          aria-hidden="true"
          style:width="{layout.width}px"
          style:height="{layout.height}px"
        ></div>
        <Accessibility {ctx} {instanceId} />
      </div>
      <canvas
        class="canvas-table__canvas"
        aria-hidden="true"
        {@attach holdCanvas}
      ></canvas>
      <RowControls {ctx} />
      <Overlays {ctx} {nav} {keyboard} />
    </Menu>
  </div>
</div>
