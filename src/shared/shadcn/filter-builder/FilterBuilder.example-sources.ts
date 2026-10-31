export const Basic = `<script lang="ts">
  import { FilterBuilder, createFilterState, type FilterField } from "@lapismd/design-core/shadcn/filter-builder";
  import "@lapismd/design-core/styles.css";
  const fields: FilterField[] = [
    { id: "name", label: "Name", type: "text" },
    { id: "amount", label: "Amount", type: "number" },
    { id: "active", label: "Active", type: "boolean" },
  ];
  let filter = $state(createFilterState());
</script>
<FilterBuilder {fields} value={filter} onValueChange={(next) => { filter = next; }} />`;
