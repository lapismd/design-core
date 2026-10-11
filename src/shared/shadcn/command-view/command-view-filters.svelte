<script lang="ts">
  import type { Snippet } from "svelte";

  export interface CommandViewFilterTab {
    id: string;
    label: string;
  }

  let {
    tabs,
    value = $bindable(""),
    label = "Result filters",
    onValueChange,
    start,
  }: {
    tabs: CommandViewFilterTab[];
    value?: string;
    label?: string;
    onValueChange?: (id: string) => void;
    start?: Snippet<[{ tab: CommandViewFilterTab }]>;
  } = $props();

  function select(id: string): void {
    value = id;
    onValueChange?.(id);
  }
</script>

<div
  data-ui-component="command-view"
  data-ui-part="filters"
  data-slot="command-view-filters"
  role="tablist"
  aria-label={label}
>
  {#each tabs as tab (tab.id)}
    <button
      type="button"
      role="tab"
      aria-selected={value === tab.id}
      tabindex={value === tab.id ? 0 : -1}
      data-state={value === tab.id ? "active" : "inactive"}
      onclick={() => select(tab.id)}
    >
      {@render start?.({ tab })}
      {tab.label}
    </button>
  {/each}
</div>
