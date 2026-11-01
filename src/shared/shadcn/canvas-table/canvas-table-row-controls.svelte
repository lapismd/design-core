<script lang="ts">
  import { untrack } from "svelte";
  import type { CanvasTableRowId } from "./canvas-table-types.js";
  import * as RadioGroup from "../radio-group/index.js";
  import { rowSelectionOptions } from "./canvas-table-selection.js";
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
  const options = $derived(rowSelectionOptions(config.rowSelection));
  const filtered = $derived(
    (config.selectionRowIds ?? layout.body.map((entry) => entry.row.id)).filter(
      (id) =>
        layout.byId.has(id) && !(layout.headerRow && config.rows[0]?.id === id),
    ),
  );
  const selected = $derived(config.selectedRowIds ?? []);
  const status = $derived(selectionStatus(selected, filtered));
  const disabled = $derived(
    !config.onSelectedRowIdsChange || options.disabled === true,
  );
  let clearingSingle = false;
  function clearSingle() {
    clearingSingle = true;
    config.onSelectedRowIdsChange?.([]);
    queueMicrotask(() => {
      clearingSingle = false;
    });
  }
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
    <div
      class="canvas-table__checkbox canvas-table__checkbox--all"
      style:height="{layout.letterHeight}px"
    >
      {#if options.mode === "single"}
        {#if !options.required}<button
            type="button"
            aria-label="Clear row selection"
            disabled={disabled || !selected.length}
            onclick={() => config.onSelectedRowIdsChange?.([])}>×</button
          >{/if}
      {:else}
        <Checkbox
          aria-label="Select all filtered rows"
          oncontextmenu={(event) => event.stopPropagation()}
          checked={status.checked}
          indeterminate={status.indeterminate}
          disabled={disabled || filtered.length === 0}
          onCheckedChange={() =>
            config.onSelectedRowIdsChange?.(
              toggleFiltered(selected, filtered, options),
            )}
        />
      {/if}
    </div>
    {#if options.mode === "single"}
      <RadioGroup.Root
        {disabled}
        bind:value={
          () => JSON.stringify(selected[0] ?? null),
          (value) => {
            const id: unknown = JSON.parse(value);
            if (
              !clearingSingle &&
              !disabled &&
              (typeof id === "string" || typeof id === "number") &&
              !selected.includes(id)
            )
              config.onSelectedRowIdsChange?.([id]);
          }
        }
        aria-label="Selected row"
        class="canvas-table__radio-group"
      >
        {@render checks()}
      </RadioGroup.Root>
    {:else}{@render checks()}{/if}
  </div>
{/if}

{#snippet checks()}
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
        {#if options.mode === "single"}
          <RadioGroup.Item
            value={JSON.stringify(entry.row.id)}
            aria-label={"Select row " + entry.number}
            tabindex={canFocus(entry.row.id) ? 0 : -1}
            onfocus={() => {
              focusedId = entry.row.id;
            }}
            onblur={(event) => {
              if (event.relatedTarget) focusedId = null;
            }}
            onkeydown={(event) => {
              if (
                (event.key === " " || event.key === "Enter") &&
                !disabled &&
                !options.required &&
                selected.includes(entry.row.id)
              ) {
                event.preventDefault();
                clearSingle();
              }
            }}
            onclick={() => {
              if (
                !disabled &&
                !options.required &&
                selected.includes(entry.row.id)
              )
                clearSingle();
            }}
          />
        {:else}
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
                toggleRow(selected, entry.row.id, options),
              )}
          />
        {/if}
      </div>
    {/each}
  </div>
{/snippet}
