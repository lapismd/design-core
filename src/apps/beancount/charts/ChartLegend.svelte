<script lang="ts">
  import * as ToggleGroup from "@stevejuma/ui/shadcn/toggle-group";

  export type ChartLegendItem = {
    id: string;
    label: string;
    color?: string;
  };

  let {
    items,
    selection = "multiple",
    selectedIds = [],
    onSelectedIdsChange = () => {},
  }: {
    items: readonly ChartLegendItem[];
    /** A line/bar chart can show many series; a hierarchy chart chooses one. */
    selection?: "multiple" | "single";
    selectedIds?: readonly string[];
    onSelectedIdsChange?: (ids: string[]) => void;
  } = $props();

  function changeSingle(value: string | undefined) {
    if (value) onSelectedIdsChange([value]);
  }

  function changeMultiple(value: string[] | undefined) {
    if (value) onSelectedIdsChange(value);
  }
</script>

{#snippet legendItems()}
  {#each items as item (item.id)}
    {@const selected = selectedIds.includes(item.id)}
    <ToggleGroup.Item value={item.id} aria-label={`Toggle ${item.label}`}>
      {#if item.color}
        <span
          style={`background-color: ${item.color}`}
          class="bc-chart-legend__swatch"
        ></span>
      {/if}
      <span class:bc-chart-legend__label--hidden={!selected}>{item.label}</span>
    </ToggleGroup.Item>
  {/each}
{/snippet}

{#if selection === "single"}
  <ToggleGroup.Root
    variant="outline"
    type="single"
    value={selectedIds[0] ?? ""}
    onValueChange={changeSingle}
    aria-label="Chart series"
  >
    {@render legendItems()}
  </ToggleGroup.Root>
{:else}
  <ToggleGroup.Root
    variant="outline"
    type="multiple"
    value={[...selectedIds]}
    onValueChange={changeMultiple}
    aria-label="Chart series"
  >
    {@render legendItems()}
  </ToggleGroup.Root>
{/if}

<style>
  .bc-chart-legend__swatch {
    display: inline-block;
    width: var(--ui-beancount-space-3);
    height: var(--ui-beancount-space-3);
    margin-inline-end: var(--ui-beancount-space-1);
    border-radius: 999px;
  }

  .bc-chart-legend__label--hidden {
    text-decoration: line-through;
  }
</style>
