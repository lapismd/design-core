export const Composable = `<script lang="ts">
  import { CanvasTable, type CanvasTableColumnContext, type CanvasTableCellContext } from "@lapismd/design-core/shadcn/canvas-table";
  const rows = [{ id: "alpha", cells: ["Alpha", "125"] }];
  let widths = $state([240, 180]);
  let selected = $state<(string | number)[]>([]);
</script>
{#snippet header(column: CanvasTableColumnContext)}<strong>{column.label}</strong>{/snippet}
{#snippet cell(context: CanvasTableCellContext)}<span>{context.value}</span>{/snippet}
<div style="height: 400px">
  <CanvasTable {rows} columns={[{ id: "name", label: "Name", header, cell }, { id: "amount", label: "Amount", header, cell }]}
    columnWidths={widths} onColumnWidthsChange={next => { widths = next; }}
    headerRow={false} toolbar={false} contextMenu={false} rowHeight={36} columnHeaderHeight={64}
    rowSelection selectedRowIds={selected} onSelectedRowIdsChange={next => { selected = next; }} />
</div>`;
