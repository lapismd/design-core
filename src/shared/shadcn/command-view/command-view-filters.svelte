<script lang="ts">
  export interface CommandViewFilterTab {
    id: string;
    label: string;
  }

  let {
    tabs,
    value = $bindable(""),
    label = "Result filters",
    onValueChange,
  }: {
    tabs: CommandViewFilterTab[];
    value?: string;
    label?: string;
    onValueChange?: (id: string) => void;
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
      {tab.label}
    </button>
  {/each}
</div>
