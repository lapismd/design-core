<script lang="ts">
  import { untrack } from "svelte";
  import {
    cellRect,
    visibleColumns,
    visibleRows,
  } from "./canvas-table-layout.js";
  import type { TableContext } from "./canvas-table-context.js";
  import type { CanvasTableRowId } from "./canvas-table-types.js";
  import type { CanvasTableColumnContext } from "./canvas-table-composition-types.js";
  import Details from "./canvas-table-row-details.svelte";
  let { ctx, instanceId }: { ctx: TableContext; instanceId: string } = $props();
  const p = $derived(ctx.props());
  const layout = $derived(ctx.layout());
  const columns = $derived.by(() => {
    const range = visibleColumns(layout, ctx.state.left, ctx.state.width);
    const result = Array.from(
      { length: range.end - range.start },
      (_, i) => range.start + i,
    );
    if (ctx.state.active && !result.includes(ctx.state.active.col))
      result.push(ctx.state.active.col);
    return result;
  });
  const entries = $derived.by(() => {
    const range = visibleRows(layout, ctx.state.top, ctx.state.height);
    const result = layout.body.slice(range.start, range.end);
    const active = ctx.state.active?.rowId;
    if (active != null && !result.some((entry) => entry.row.id === active)) {
      const entry = layout.bodyIndex.get(active);
      if (entry != null && layout.body[entry]) result.push(layout.body[entry]!);
    }
    return result;
  });
  function columnContext(col: number): CanvasTableColumnContext {
    const c = p.columns?.[col];
    return { id: c?.id ?? String(col), label: c?.label ?? "", column: col };
  }
  function toggle(id: CanvasTableRowId) {
    const ids = p.expandedRowIds ?? [];
    if (ids.includes(id)) {
      const active = ctx.state.scroller?.ownerDocument.activeElement;
      if (
        active instanceof Element &&
        active
          .closest("[data-canvas-detail]")
          ?.getAttribute("data-canvas-detail") === JSON.stringify(id)
      )
        ctx.state.scroller?.focus();
    }
    p.onExpandedRowIdsChange?.(
      ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id],
    );
  }
  let focused = $state<{ id: CanvasTableRowId; col: number } | null>(null);
  $effect.pre(() => {
    const current = focused;
    if (
      current &&
      (!entries.some((entry) => entry.row.id === current.id) ||
        !columns.includes(current.col))
    )
      untrack(() => {
        focused = null;
        ctx.state.scroller?.focus();
      });
  });
  function recoverFocus(node: HTMLElement) {
    const focus = () => {
      focused = {
        id: JSON.parse(node.dataset.richRowId!),
        col: Number(node.dataset.richColumn),
      };
    };
    const blur = (event: FocusEvent) => {
      if (event.relatedTarget && !node.contains(event.relatedTarget as Node))
        focused = null;
    };
    node.addEventListener("focusin", focus);
    node.addEventListener("focusout", blur);
    return () => {
      node.removeEventListener("focusin", focus);
      node.removeEventListener("focusout", blur);
      if (
        node.contains(node.ownerDocument.activeElement) &&
        ctx.state.scroller?.isConnected
      )
        ctx.state.scroller.focus();
    };
  }
</script>

<div
  class="canvas-table__rich-grid"
  role="rowgroup"
  style:width="{layout.width}px"
  style:height="{layout.height}px"
>
  <div
    role="row"
    aria-rowindex="1"
    class="canvas-table__rich-header"
    style:height="{layout.letterHeight}px"
  >
    {#each columns as col (p.columns?.[col]?.id ?? col)}
      {@const c = p.columns?.[col]}
      {@const x = layout.edges[col] ?? layout.gutter}
      <div
        role="columnheader"
        tabindex="-1"
        aria-colindex={col + 1}
        class="canvas-table__rich-heading"
        style:left="{x}px"
        style:width="{layout.widths[col]}px"
        style:clip-path={"inset(0 0 0 " +
          Math.max(0, ctx.state.left + layout.gutter - x) +
          "px)"}
        onpointerdown={(e) => {
          if (!(e.target as Element).closest("[data-canvas-resize]"))
            e.stopPropagation();
        }}
      >
        {#if c?.header}{@render c.header(
            columnContext(col),
          )}{:else}{c?.label}{/if}
        {#if p.onColumnWidthsChange}<span
            class="canvas-table__resize-handle"
            data-canvas-resize
            aria-hidden="true"
          ></span>{/if}
      </div>
    {/each}
  </div>
  {#each entries as entry (entry.row.id)}
    {@const index = layout.bodyIndex.get(entry.row.id) ?? 0}
    <div
      role="row"
      aria-rowindex={entry.number + 1}
      aria-selected={p.rowSelection
        ? (p.selectedRowIds ?? []).includes(entry.row.id)
        : undefined}
    >
      {#each columns as col (p.columns?.[col]?.id ?? col)}
        {@const rect = cellRect(layout, index, col)}
        {@const c = p.columns?.[col]}
        <div
          role="gridcell"
          data-rich-row-id={JSON.stringify(entry.row.id)}
          data-rich-column={col}
          aria-colindex={col + 1}
          aria-readonly={!p.onCellChange}
          id={instanceId + "-cell-" + (entry.number - 1) + "-" + col}
          class:canvas-table__fallback-cell={!c?.cell}
          class="canvas-table__rich-cell"
          style:left="{rect.x}px"
          style:top="{rect.y}px"
          style:width="{rect.width}px"
          style:height="{rect.height}px"
          style:clip-path={"inset(" +
            Math.max(0, ctx.state.top + layout.chrome - rect.y) +
            "px 0 0 " +
            Math.max(0, ctx.state.left + layout.gutter - rect.x) +
            "px)"}
          {@attach recoverFocus}
        >
          {#if c?.cell}
            {@render c.cell({
              ...columnContext(col),
              row: entry.row,
              rowNumber: entry.number,
              value: entry.row.cells[col] ?? "",
              expanded: (p.expandedRowIds ?? []).includes(entry.row.id),
              toggleExpanded: () => toggle(entry.row.id),
            })}
          {:else}<span class="canvas-table__cell-text"
              >{entry.row.cells[col] ?? ""}</span
            >{/if}
        </div>
      {/each}
      {#if p.rowDetails && (p.expandedRowIds ?? []).includes(entry.row.id)}
        <Details {ctx} {entry} {index} close={() => toggle(entry.row.id)} />
      {/if}
    </div>
  {/each}
</div>
