<script lang="ts">
  import { untrack } from "svelte";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import RecordDetails from "./CanvasTableRecordDetails.stories.fixture.svelte";
  import { Button } from "../button/index.js";
  import {
    CanvasTable,
    type CanvasTableRowId,
    type CanvasTableColumnContext,
    type CanvasTableCellContext,
    type CanvasTableRowContext,
  } from "./index.js";
  let {
    large = false,
    single = false,
    optional = false,
  }: { large?: boolean; single?: boolean; optional?: boolean } = $props();
  const rows = $derived(
    Array.from({ length: large ? 4000 : 40 }, (_, index) => ({
      id: index + 1,
      cells: [
        "Record " + (index + 1),
        String(index * 125),
        "Details " + index,
        ...Array.from({ length: large ? 37 : 0 }, (_, col) => "Cell " + col),
      ],
    })),
  );
  let widths = $state(
    untrack(() => Array(large ? 40 : 3).fill(210) as number[]),
  );
  let selected = $state<CanvasTableRowId[]>(untrack(() => (single ? [1] : [])));
  let expanded = $state<CanvasTableRowId[]>([]);
  let page = $state(false);
  let mounted = $state(true);
  const columns = $derived(
    widths.map((_, index) => ({
      id: "field-" + index,
      label: index === 0 ? "Name" : index === 1 ? "Amount" : "Field " + index,
      header,
      cell,
    })),
  );
</script>

{#snippet header(context: CanvasTableColumnContext)}
  <div class="composition-header">
    <strong>{context.label}</strong><small>Inline summary</small>
    <div
      class="composition-summary"
      role="img"
      aria-label={context.label + " distribution"}
    ></div>
  </div>
{/snippet}
{#snippet cell(context: CanvasTableCellContext)}
  {#if context.column === 0}<Button
      variant="ghost"
      size="icon-xs"
      aria-label={(context.expanded ? "Collapse row " : "Expand row ") +
        context.rowNumber}
      aria-expanded={context.expanded}
      onclick={context.toggleExpanded}
      >{#if context.expanded}<ChevronDown
          aria-hidden="true"
        />{:else}<ChevronRight aria-hidden="true" />{/if}</Button
    >{/if}
  <span>{context.value}</span>
{/snippet}
{#snippet details(context: CanvasTableRowContext)}
  <RecordDetails {context} />
{/snippet}
<div class="composition-fixture">
  <div class="composition-actions">
    <Button
      onclick={() => {
        page = !page;
      }}>Change page</Button
    ><Button
      onclick={() => {
        mounted = !mounted;
      }}>Toggle table</Button
    ><output aria-label="Selected IDs">{selected.join(", ")}</output>
  </div>
  <div class="composition-table">
    {#if mounted}<CanvasTable
        {rows}
        {columns}
        columnWidths={widths}
        onColumnWidthsChange={(next) => {
          widths = next;
        }}
        headerRow={false}
        toolbar={false}
        contextMenu={false}
        rowHeight={36}
        columnHeaderHeight={88}
        visibleRowIds={rows
          .slice(page ? 20 : 0, page ? 40 : large ? 4000 : 20)
          .map((row) => row.id)}
        selectionRowIds={rows.map((row) => row.id)}
        rowSelection={single ? { mode: "single", required: !optional } : true}
        selectedRowIds={selected}
        onSelectedRowIdsChange={(next) => {
          selected = next;
        }}
        expandedRowIds={expanded}
        onExpandedRowIdsChange={(next) => {
          expanded = next;
        }}
        rowDetails={details}
        aria-label="Composable data table"
      />{/if}
  </div>
</div>

<style>
  .composition-fixture {
    display: grid;
    gap: 1rem;
    padding: 1rem;
  }
  .composition-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .composition-table {
    height: 440px;
    max-width: 100%;
  }
  .composition-header {
    display: grid;
    gap: 0.3rem;
    padding: 0.5rem;
    font-family: var(--font-sans);
  }
  .composition-summary {
    height: 16px;
    background: linear-gradient(
      90deg,
      var(--primary) 20%,
      transparent 20%,
      transparent 25%,
      var(--primary) 25%,
      var(--primary) 70%,
      transparent 70%
    );
    opacity: 0.5;
  }
</style>
