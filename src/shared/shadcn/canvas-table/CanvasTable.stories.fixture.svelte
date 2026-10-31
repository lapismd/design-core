<script lang="ts">
  import { createFilterState } from "../filter-builder/index.js";
  let structuredValue = $state(createFilterState());
  import { untrack } from "svelte";
  import { Button } from "../button/index.js";
  import { CanvasTable } from "./index.js";
  import type {
    CanvasTableCommand,
    CanvasTableRow,
    CanvasTableRowId,
  } from "./index.js";
  import { demoRows, demoCommand } from "./canvas-table.stories.fixture.js";

  let {
    count = 12,
    rowNumbers = true,
    rowSelection = true,
    empty = false,
    wide = false,
    structuredFilters = false,
    readOnly = false,
  }: {
    count?: number;
    rowNumbers?: boolean;
    rowSelection?: boolean;
    empty?: boolean;
    wide?: boolean;
    structuredFilters?: boolean;
    readOnly?: boolean;
  } = $props();
  let rows = $state<CanvasTableRow[]>(
    untrack(() => (empty ? [] : demoRows(count))),
  );
  let widths = $state(
    untrack(() =>
      wide ? Array.from({ length: 80 }, () => 120) : [150, 120, 240],
    ),
  );
  let selected = $state<CanvasTableRowId[]>([]);
  let header = $state(true);
  let filtering = $state(false);
  let mounted = $state(true);
  let sort = $state<{ column: number; direction: "asc" | "desc" } | null>(null);
  type Snapshot = { rows: CanvasTableRow[]; widths: number[] };
  let undo = $state<Snapshot[]>([]);
  let redo = $state<Snapshot[]>([]);
  let baseline: CanvasTableRow[] | null = null;
  const filtered = $derived(
    filtering
      ? rows
          .slice(header ? 1 : 0)
          .filter((row) => row.cells[1] === "Open")
          .map((row) => row.id)
      : undefined,
  );
  function snapshot(): Snapshot {
    return {
      rows: rows.map((row) => ({ ...row, cells: [...row.cells] })),
      widths: [...widths],
    };
  }
  function publish(next: CanvasTableRow[]) {
    undo = [...undo, snapshot()];
    redo = [];
    rows = next;
  }
  function edit(id: CanvasTableRowId, column: number, value: string) {
    publish(
      rows.map((row) => {
        if (row.id !== id) return row;
        const cells = [...row.cells];
        while (cells.length <= column) cells.push("");
        cells[column] = value;
        return { ...row, cells };
      }),
    );
  }
  function apply(command: CanvasTableCommand) {
    publish(demoCommand(rows, command));
    if (command.target === "column") {
      const next = [...widths];
      if (command.id === "delete") next.splice(command.column, 1);
      else if (command.id === "move-left" || command.id === "move-right")
        next.splice(
          command.column + (command.id === "move-left" ? -1 : 1),
          0,
          ...next.splice(command.column, 1),
        );
      widths = next;
    }
    sort = null;
    baseline = null;
  }
  function sortColumn(column: number) {
    baseline ??= rows;
    const next =
      sort?.column !== column
        ? "asc"
        : sort.direction === "asc"
          ? "desc"
          : null;
    const source = [...baseline];
    const fixed = header ? source.shift() : undefined;
    source.sort(
      (a, b) =>
        (a.cells[column] ?? "").localeCompare(
          b.cells[column] ?? "",
          undefined,
          { numeric: true },
        ) * (next === "desc" ? -1 : 1),
    );
    publish(next ? [...(fixed ? [fixed] : []), ...source] : baseline);
    sort = next ? { column, direction: next } : null;
    if (!next) baseline = null;
  }
  function stepHistory(direction: "undo" | "redo") {
    const source = direction === "undo" ? undo : redo;
    const entry = source.at(-1);
    if (!entry) return;
    if (direction === "undo") {
      redo = [...redo, snapshot()];
      undo = undo.slice(0, -1);
    } else {
      undo = [...undo, snapshot()];
      redo = redo.slice(0, -1);
    }
    rows = entry.rows;
    widths = entry.widths;
    sort = null;
    baseline = null;
  }
</script>

<div class="canvas-table-demo">
  <div class="canvas-table-demo__controls">
    <Button
      variant="outline"
      size="sm"
      onclick={() => {
        filtering = !filtering;
      }}>Filter open rows</Button
    >
    <Button
      variant="outline"
      size="sm"
      onclick={() => {
        rows = [
          ...rows.slice(0, header ? 1 : 0),
          ...rows.slice(header ? 1 : 0).reverse(),
        ];
      }}>Reverse rows</Button
    >
    <Button
      variant="outline"
      size="sm"
      onclick={() => {
        rows = rows.filter((row) => !selected.includes(row.id));
      }}>Remove selected externally</Button
    >
    <Button
      variant="outline"
      size="sm"
      onclick={() => {
        mounted = !mounted;
      }}>Toggle mounted</Button
    >
    <output aria-label="Selected rows">{selected.length} selected</output>
  </div>
  <div class="canvas-table-demo__frame">
    {#if mounted}
      <CanvasTable
        {rows}
        filtering={structuredFilters
          ? {
              value: structuredValue,
              onValueChange: (next) => {
                structuredValue = next;
              },
            }
          : undefined}
        columnWidths={widths}
        visibleRowIds={filtered}
        headerRow={header}
        {rowNumbers}
        {rowSelection}
        selectedRowIds={selected}
        onSelectedRowIdsChange={(ids) => {
          selected = ids;
        }}
        onCellChange={readOnly ? undefined : edit}
        onColumnWidthsChange={readOnly
          ? undefined
          : (next) => {
              widths = next;
            }}
        onCommand={readOnly ? undefined : apply}
        onSort={sortColumn}
        {sort}
        onHeaderRowChange={(value) => {
          header = value;
        }}
        canUndo={undo.length > 0}
        canRedo={redo.length > 0}
        onUndo={() => stepHistory("undo")}
        onRedo={() => stepHistory("redo")}
      >
        {#snippet selectionActions(ids)}<span aria-label="Selection actions"
            >{ids.length} rows</span
          >{/snippet}
      </CanvasTable>
    {/if}
  </div>
  <output class="canvas-table-demo__value" aria-label="First data value"
    >{rows[header ? 1 : 0]?.cells[0] ?? "Empty"}</output
  >
</div>

<style>
  .canvas-table-demo {
    width: 100%;
    min-width: 0;
  }
  .canvas-table-demo__controls {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    padding-block: 8px;
  }
  .canvas-table-demo__frame {
    height: 360px;
    width: 100%;
    min-width: 0;
    border: 1px solid var(--border);
  }
  .canvas-table-demo__value {
    display: block;
    padding-block: 6px;
  }
</style>
