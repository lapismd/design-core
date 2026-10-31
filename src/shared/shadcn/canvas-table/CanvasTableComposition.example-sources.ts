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

export const Display = `<script lang="ts">
  import { CanvasTable, type CanvasTableCellContext } from "@lapismd/design-core/shadcn/canvas-table";
  import { Toggle } from "@lapismd/design-core/shadcn/toggle";
  let wrapText = $state(false), columnColours = $state(false);
  const rows = [{ id: "alpha", cells: ["Detailed research findings for the team review."] }];
</script>
{#snippet cell(context: CanvasTableCellContext)}<span>{context.value}</span>{/snippet}
<Toggle bind:pressed={wrapText}>Wrap text</Toggle>
<Toggle bind:pressed={columnColours}>Column colours</Toggle>
<div style="height: 260px">
  <CanvasTable {rows} columnWidths={[180]} headerRow={false} toolbar={false}
    columns={[{ id: "summary", label: "Summary", cell }]} {wrapText} {columnColours} />
</div>`;
