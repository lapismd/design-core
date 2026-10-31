<script lang="ts">
  import { untrack } from "svelte";
  import type { CanvasTableRowId } from "./canvas-table-types.js";
  import { Checkbox } from "../checkbox/index.js";
  import { cellRect, visibleRows } from "./canvas-table-layout.js";
  import {
    selectionStatus,
    toggleFiltered,
    toggleRow,
  } from "./canvas-table-selection.js";
  import type { TableContext } from "./canvas-table-context.js";

  let { ctx }: { ctx: TableContext } = $props();
  const config = $derived(ctx.props());
  const layout = $derived(ctx.layout());
  const range = $derived(visibleRows(layout, ctx.state.top, ctx.state.height));
  const entries = $derived(layout.body.slice(range.start, range.end));
  const filtered = $derived(layout.body.map((entry) => entry.row.id));
  const selected = $derived(config.selectedRowIds ?? []);
  const status = $derived(selectionStatus(selected, filtered));
  const disabled = $derived(!config.onSelectedRowIdsChange);
  function canFocus(id: CanvasTableRowId): boolean {
    const index = layout.bodyIndex.get(id);
    if (index == null) return false;
    const box = cellRect(layout, index, 0);
    const center = box.y - ctx.state.top + box.height / 2;
    return center - 8 >= layout.chrome && center + 8 <= ctx.state.height;
  }
  let focusedId = $state<CanvasTableRowId | null>(null);
  $effect(() => {
    if (
      focusedId != null &&
      (!config.rowSelection ||
        !config.onSelectedRowIdsChange ||
        !canFocus(focusedId))
    ) {
      untrack(() => {
        focusedId = null;
        ctx.state.scroller?.focus();
      });
    }
  });
</script>

{#if config.rowSelection}
  <div
    class="canvas-table__row-controls"
    style:left="{layout.numberWidth}px"
    style:width="{layout.checkboxWidth}px"
    style:height="{ctx.state.height}px"
  >
    <div class="canvas-table__checkbox canvas-table__checkbox--all">
      <Checkbox
        aria-label="Select all filtered rows"
        oncontextmenu={(event) => event.stopPropagation()}
        checked={status.checked}
        indeterminate={status.indeterminate}
        disabled={disabled || filtered.length === 0}
        onCheckedChange={() =>
          config.onSelectedRowIdsChange?.(toggleFiltered(selected, filtered))}
      />
    </div>
    <div class="canvas-table__body-checks" style:top="{layout.chrome}px">
      {#each entries as entry (entry.row.id)}
        {@const index = layout.bodyIndex.get(entry.row.id) ?? 0}
        {@const rect = cellRect(layout, index, 0)}
        <div
          class="canvas-table__checkbox"
          style:top="{rect.y - layout.chrome - ctx.state.top}px"
          style:height="{rect.height}px"
          data-row-id={entry.row.id}
        >
          <Checkbox
            aria-label={"Select row " + entry.number}
            tabindex={canFocus(entry.row.id) ? 0 : -1}
            onfocus={() => {
              focusedId = entry.row.id;
            }}
            onblur={(event) => {
              if (event.relatedTarget) focusedId = null;
            }}
            oncontextmenu={(event) => event.stopPropagation()}
            checked={selected.includes(entry.row.id)}
            {disabled}
            onCheckedChange={() =>
              config.onSelectedRowIdsChange?.(
                toggleRow(selected, entry.row.id),
              )}
          />
        </div>
      {/each}
    </div>
  </div>
{/if}
