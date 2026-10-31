<script lang="ts">
  import {
    FilterBuilder,
    createFilterState,
    type FilterField,
    type StructuredFilterState,
  } from "@lapismd/design-core/shadcn/filter-builder";
  import {
    CanvasTable,
    inferCanvasTableColumnTypes,
    type CanvasTableFiltering,
  } from "@lapismd/design-core/shadcn/canvas-table";
  import {
    FilterBuilder as FilterAlias,
    FilterType,
    type StructuredFilterType,
  } from "@lapismd/design-core/filter";
  const fields = [
    { id: "name", label: "Name", type: "text", allowTypeOverride: true },
  ] as const satisfies readonly FilterField[];
  let state = $state<StructuredFilterState>(createFilterState());
  const rows = [
    { id: "header", cells: ["Name"] },
    { id: "a", cells: ["Alpha"] },
  ];
  const mode: StructuredFilterType = "text";
  const legacyMode = FilterType.AND;
  const types = inferCanvasTableColumnTypes(rows, { columnCount: 1 });
  const config = $derived({
    value: state,
    onValueChange: (next: StructuredFilterState) => {
      state = next;
    },
  } satisfies CanvasTableFiltering);
</script>

<FilterBuilder
  {fields}
  value={state}
  onValueChange={(next) => {
    state = next;
  }}
/>
<FilterAlias
  {fields}
  value={state}
  onValueChange={(next) => {
    state = next;
  }}
/>
<div style="height: 320px">
  <CanvasTable {rows} columnWidths={[180]} filtering={config} />
</div>
<output>{types.join(",")} {mode} {legacyMode}</output>
