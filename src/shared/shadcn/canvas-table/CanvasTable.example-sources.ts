export const Basic = `<script lang="ts">
  import { CanvasTable, type CanvasTableRow } from "@lapismd/design-core/shadcn/canvas-table";
  import "@lapismd/design-core/styles.css";

  let rows = $state<CanvasTableRow[]>([
    { id: "header", cells: ["Name", "Status"] },
    { id: "alpha", cells: ["Alpha", "Open"] },
    { id: "beta", cells: ["Beta", "Closed"] },
  ]);
  let widths = $state([180, 120]);
  function edit(id: string | number, column: number, value: string) {
    rows = rows.map((row) => row.id === id
      ? { ...row, cells: row.cells.map((cell, index) => index === column ? value : cell) }
      : row);
  }
</script>

<div style="height: 360px">
  <CanvasTable {rows} columnWidths={widths} onCellChange={edit}
    onColumnWidthsChange={(next) => { widths = next; }} />
</div>`;

export const Selection = Basic.replace(
  "  let widths = $state([180, 120]);",
  "  let widths = $state([180, 120]);\n  let selected = $state<(string | number)[]>([]);",
).replace(
  "columnWidths={widths} onCellChange={edit}",
  "columnWidths={widths} onCellChange={edit} rowSelection\n    selectedRowIds={selected} onSelectedRowIdsChange={(ids) => { selected = ids; }}",
);
