<script lang="ts">
  import type { Snippet } from "svelte";
  import * as ScrollArea from "@stevejuma/ui/shadcn/scroll-area";
  import * as Tabs from "@stevejuma/ui/shadcn/tabs";

  export type ChartPerspective = {
    id: string;
    label: string;
  };

  let {
    charts,
    activeChartId,
    ariaLabel = "Chart perspectives",
    onActiveChartChange = () => {},
    children,
  }: {
    charts: readonly ChartPerspective[];
    activeChartId: string;
    ariaLabel?: string;
    onActiveChartChange?: (id: string) => void;
    /** Receives the active chart id so the parent can render its chart data. */
    children?: Snippet<[string]>;
  } = $props();
</script>

<Tabs.Root
  value={activeChartId}
  class="bc-chart-switcher"
  onValueChange={(next) => {
    if (next) onActiveChartChange(next);
  }}
>
  <Tabs.Content value={activeChartId}>
    {@render children?.(activeChartId)}
  </Tabs.Content>
  <ScrollArea.Root orientation="horizontal" class="bc-chart-switcher__scroll">
    <div class="bc-chart-switcher__tabs">
      <Tabs.List aria-label={ariaLabel}>
        {#each charts as chart (chart.id)}
          <Tabs.Trigger value={chart.id}>{chart.label || "All"}</Tabs.Trigger>
        {/each}
      </Tabs.List>
    </div>
  </ScrollArea.Root>
</Tabs.Root>

<style>
  :global(.bc-chart-switcher),
  :global(.bc-chart-switcher__scroll) {
    width: 100%;
  }

  .bc-chart-switcher__tabs {
    width: max-content;
    margin-inline: auto;
    padding-block: var(--ui-beancount-space-2);
  }
</style>
