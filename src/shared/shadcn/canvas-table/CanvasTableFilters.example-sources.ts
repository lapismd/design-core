export const StructuredFilters = `<script lang="ts">
  import { CanvasTable } from "@lapismd/design-core/shadcn/canvas-table";
  import { createFilterState } from "@lapismd/design-core/shadcn/filter-builder";
  import "@lapismd/design-core/styles.css";
  const rows = [
    { id: "header", cells: ["Name", "Amount", "Active"] },
    { id: "alpha", cells: ["Alpha", "120", "true"] },
    { id: "beta", cells: ["Beta", "80", "false"] },
  ];
  let filter = $state(createFilterState());
</script>
<div style="height: 420px">
  <CanvasTable {rows} columnWidths={[200, 120, 100]}
    filtering={{ value: filter, onValueChange: (next) => { filter = next; } }} />
</div>`;
