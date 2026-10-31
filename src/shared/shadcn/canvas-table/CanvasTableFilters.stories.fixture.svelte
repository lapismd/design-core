<script lang="ts">
  import { Button } from "../button/index.js";
  import {
    createFilterState,
    type StructuredFilterState,
  } from "../filter-builder/index.js";
  import {
    CanvasTable,
    type CanvasTableRow,
    type CanvasTableRowId,
  } from "./index.js";
  let {
    large = false,
    explicit = false,
    narrow = false,
  }: { large?: boolean; explicit?: boolean; narrow?: boolean } = $props();
  let rows = $state<CanvasTableRow[]>([]);
  let selected = $state<CanvasTableRowId[]>([]);
  let filter = $state<StructuredFilterState>(createFilterState());
  let widths = $state([200, 130, 120, 155, 130, 240]);
  let mounted = $state(true);
  let restrict = $state(false);
  let revision = $state(0);
  let sort = $state<{ column: number; direction: "asc" | "desc" } | null>(null);
  let initialized = false;
  $effect(() => {
    if (initialized) return;
    initialized = true;
    rows = [
      {
        id: "header",
        cells: ["Name", "Status", "Amount", "Created", "Active", "Notes"],
      },
      ...Array.from({ length: large ? 10000 : 24 }, (_, i) => ({
        id: "record-" + (i + 1),
        cells: [
          "Record " + (i + 1),
          i % 2 ? "Closed" : "Open",
          String(i * 25),
          "2026-10-" + String((i % 28) + 1).padStart(2, "0"),
          i % 2 ? "false" : "true",
          i === 0
            ? "A longer note that can wrap across several lines in a narrow column."
            : "Project notes " + (i + 1),
        ],
      })),
    ];
  });
  const columns = $derived(
    explicit
      ? [
          { id: "name", column: 0 },
          {
            id: "status",
            column: 1,
            type: "enum" as const,
            options: [
              { value: "Open", label: "Open" },
              { value: "Closed", label: "Closed" },
            ],
          },
          { id: "amount", column: 2, type: "number" as const },
          { id: "created", column: 3 },
          { id: "active", column: 4 },
          { id: "notes", column: 5 },
        ]
      : undefined,
  );
  function edit(id: CanvasTableRowId, column: number, value: string) {
    rows = rows.map((row) => {
      if (row.id !== id) return row;
      const cells = [...row.cells];
      cells[column] = value;
      return { ...row, cells };
    });
  }
  function sortColumn(column: number) {
    const direction =
      sort?.column === column && sort.direction === "asc" ? "desc" : "asc";
    sort = { column, direction };
    rows = [
      rows[0]!,
      ...rows
        .slice(1)
        .sort(
          (a, b) =>
            (a.cells[column] ?? "").localeCompare(
              b.cells[column] ?? "",
              undefined,
              { numeric: true },
            ) * (direction === "asc" ? 1 : -1),
        ),
    ];
  }
</script>

<div class="canvas-filter-demo" style:max-width={narrow ? "390px" : "1200px"}>
  <div class="canvas-filter-demo__controls">
    <Button
      variant="outline"
      size="sm"
      onclick={() => {
        filter = createFilterState();
      }}>Reset filters externally</Button
    >
    <Button
      variant="outline"
      size="sm"
      onclick={() => {
        restrict = !restrict;
      }}>Toggle host visibility</Button
    >
    <Button
      variant="outline"
      size="sm"
      onclick={() => {
        revision++;
      }}>Re-detect types</Button
    >
    <Button
      variant="outline"
      size="sm"
      onclick={() => {
        mounted = !mounted;
      }}>Toggle mounted</Button
    >
    <output aria-label="Selected rows">{selected.length} selected</output>
    <output aria-label="Filter count"
      >{filter.root.children.length} root conditions</output
    >
  </div>
  <div class="canvas-filter-demo__table">
    {#if mounted}
      <CanvasTable
        {rows}
        columnWidths={widths}
        rowSelection
        selectedRowIds={selected}
        onSelectedRowIdsChange={(ids) => {
          selected = ids;
        }}
        visibleRowIds={restrict
          ? rows
              .slice(1)
              .filter((row) => row.cells[1] === "Open")
              .map((row) => row.id)
          : undefined}
        filtering={{
          value: filter,
          onValueChange: (next) => {
            filter = next;
          },
          columns,
          inferenceKey: revision,
        }}
        onCellChange={edit}
        onColumnWidthsChange={(next) => {
          widths = next;
        }}
        onSort={sortColumn}
        {sort}
      >
        {#snippet selectionActions(ids)}<span>{ids.length} selected rows</span
          >{/snippet}
      </CanvasTable>
    {/if}
  </div>
</div>

<style>
  .canvas-filter-demo {
    width: 100%;
  }
  .canvas-filter-demo__controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    font: 0.75rem var(--font-sans);
    color: var(--muted-foreground);
  }
  .canvas-filter-demo__table {
    height: 490px;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    overflow: hidden;
  }
</style>
