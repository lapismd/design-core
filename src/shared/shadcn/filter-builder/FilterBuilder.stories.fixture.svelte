<script lang="ts">
  import { Button } from "../button/index.js";
  import {
    FilterBuilder,
    createFilterState,
    type FilterField,
    type StructuredFilterState,
  } from "./index.js";
  let {
    nested = false,
    typed = false,
    empty = false,
    narrow = false,
  }: {
    nested?: boolean;
    typed?: boolean;
    empty?: boolean;
    narrow?: boolean;
  } = $props();
  const fields: FilterField[] = [
    { id: "name", label: "Name", type: "text", allowTypeOverride: true },
    {
      id: "status",
      label: "Status",
      type: "enum",
      options: [
        { value: "Open", label: "Open" },
        { value: "Closed", label: "Closed" },
      ],
    },
    { id: "amount", label: "Amount", type: "number" },
    { id: "active", label: "Active", type: "boolean" },
    { id: "date", label: "Created", type: "date" },
    { id: "updated", label: "Updated", type: "datetime" },
  ];
  let state = $state<StructuredFilterState>(createFilterState());
  let initialized = false;
  $effect(() => {
    if (initialized) return;
    initialized = true;
    if (nested)
      state.root.children = [
        {
          id: "name",
          kind: "condition",
          field: "name",
          operator: "contains",
          value: "Lapis",
        },
        {
          id: "group",
          kind: "group",
          match: "none",
          children: [
            {
              id: "status",
              kind: "condition",
              field: "status",
              operator: "eq",
              value: "Closed",
            },
          ],
        },
      ];
    else if (typed)
      state.root.children = [
        {
          id: "amount",
          kind: "condition",
          field: "amount",
          operator: "gte",
          value: 100,
        },
        {
          id: "active",
          kind: "condition",
          field: "active",
          operator: "eq",
          value: true,
        },
        {
          id: "date",
          kind: "condition",
          field: "date",
          operator: "gte",
          value: "2026-10-01",
        },
        {
          id: "updated",
          kind: "condition",
          field: "updated",
          operator: "lt",
          value: "2026-11-01T12:00:00Z",
        },
      ];
  });
</script>

<div class="filter-builder-demo" style:max-width={narrow ? "360px" : "760px"}>
  <FilterBuilder
    fields={empty ? [] : fields}
    value={state}
    onValueChange={(next) => {
      state = next;
    }}
  />
  <div class="filter-builder-demo__footer">
    <Button
      variant="outline"
      size="sm"
      onclick={() => {
        state = createFilterState();
      }}>Reset filters externally</Button
    >
    <output aria-label="Applied conditions"
      >{state.root.children.length} root conditions</output
    >
  </div>
</div>

<style>
  .filter-builder-demo {
    width: 100%;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    background: var(--popover);
  }
  .filter-builder-demo__footer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    border-top: 1px solid var(--border);
    padding-top: 1rem;
    margin-top: 1rem;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
</style>
