<script lang="ts">
  import { visibleRows, visibleColumns } from "./canvas-table-layout.js";
  import { columnLetter } from "./canvas-table-text.js";
  import type { TableContext } from "./canvas-table-context.js";

  let { ctx, instanceId }: { ctx: TableContext; instanceId: string } = $props();
  const config = $derived(ctx.props());
  const layout = $derived(ctx.layout());
  const range = $derived(visibleRows(layout, ctx.state.top, ctx.state.height));
  const columns = $derived.by(() => {
    const range = visibleColumns(layout, ctx.state.left, ctx.state.width);
    const values = Array.from(
      { length: range.end - range.start },
      (_, i) => range.start + i,
    );
    if (ctx.state.active && !values.includes(ctx.state.active.col))
      values.push(ctx.state.active.col);
    return values.sort((a, b) => a - b);
  });
  const entries = $derived.by(() => {
    const values = layout.body.slice(range.start, range.end);
    const activeId = ctx.state.active?.rowId;
    if (
      activeId != null &&
      !values.some((entry) => entry.row.id === activeId)
    ) {
      const entry = layout.body.find((entry) => entry.row.id === activeId);
      if (entry) values.push(entry);
    }
    return values;
  });
</script>

<div class="canvas-table__semantics" role="rowgroup">
  {#if layout.headerRow && config.rows[0]}
    <div role="row" aria-rowindex="1">
      {#each columns as col (col)}
        <div
          role="columnheader"
          id={instanceId + "-cell-0-" + col}
          aria-colindex={col + 1}
        >
          {config.rows[0].cells[col] || columnLetter(col)}
        </div>
      {/each}
    </div>
  {/if}
  {#each entries as entry (entry.row.id)}
    <div
      role="row"
      aria-rowindex={entry.number}
      aria-selected={config.rowSelection
        ? (config.selectedRowIds ?? []).includes(entry.row.id)
        : undefined}
    >
      {#each columns as col (col)}
        <div
          role="gridcell"
          id={instanceId + "-cell-" + (entry.number - 1) + "-" + col}
          aria-colindex={col + 1}
          aria-readonly={!config.onCellChange}
        >
          {entry.row.cells[col] ?? ""}
        </div>
      {/each}
    </div>
  {/each}
</div>
