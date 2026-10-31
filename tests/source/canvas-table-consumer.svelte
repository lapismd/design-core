<script lang="ts">
  import {
    CanvasTable,
    canvasTableTokenNames,
    type CanvasTableProps,
    type CanvasTableRow,
    type CanvasTableRowId,
    type CanvasTableCommand,
  } from "@lapismd/design-core/shadcn/canvas-table";

  let rows = $state<CanvasTableRow[]>([
    { id: "header", cells: ["Name", "Status"] },
    { id: "alpha", cells: ["Alpha", "Open"] },
    { id: "beta", cells: ["Beta", "Closed"] },
  ]);
  let widths = $state([180, 120]);
  let selected = $state<CanvasTableRowId[]>([]);
  let command = $state<CanvasTableCommand | null>(null);
  const optional: Partial<CanvasTableProps> = {
    visibleRowIds: undefined,
    searchCell: undefined,
    onHeaderRowChange: undefined,
    sort: undefined,
    rowNumbers: undefined,
  };
  function edit(id: CanvasTableRowId, column: number, value: string) {
    rows = rows.map((row) =>
      row.id === id
        ? {
            ...row,
            cells: row.cells.map((cell, index) =>
              index === column ? value : cell,
            ),
          }
        : row,
    );
  }
</script>

<div style="height:360px" data-accent-token={canvasTableTokenNames.accent}>
  <CanvasTable
    {...optional}
    {rows}
    columnWidths={widths}
    rowSelection
    selectedRowIds={selected}
    onSelectedRowIdsChange={(ids) => {
      selected = ids;
    }}
    onCellChange={edit}
    onColumnWidthsChange={(next) => {
      widths = next;
    }}
    onCommand={(next) => {
      command = next;
    }}
  >
    {#snippet selectionActions(ids)}<output aria-label="Selected count"
        >{ids.length}</output
      >{/snippet}
  </CanvasTable>
</div>
<output aria-label="Edited value">{rows[1]?.cells[0]}</output>
<output aria-label="Last command">{command?.id}</output>
