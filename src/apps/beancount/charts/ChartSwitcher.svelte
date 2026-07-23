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
    tabsPlacement = "bottom",
    onActiveChartChange = () => {},
    children,
  }: {
    charts: readonly ChartPerspective[];
    activeChartId: string;
    ariaLabel?: string;
    /** Put report-perspective tabs before a summary when that matches the screen hierarchy. */
    tabsPlacement?: "top" | "bottom";
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
  {#if tabsPlacement === "top"}
    <ScrollArea.Root orientation="horizontal" class="bc-chart-switcher__scroll">
      <div class="bc-chart-switcher__tabs">
        <Tabs.List aria-label={ariaLabel}>
          {#each charts as chart (chart.id)}
            <Tabs.Trigger value={chart.id}>{chart.label || "All"}</Tabs.Trigger>
          {/each}
        </Tabs.List>
      </div>
    </ScrollArea.Root>
  {/if}

  <Tabs.Content value={activeChartId}>
    {@render children?.(activeChartId)}
  </Tabs.Content>

  {#if tabsPlacement === "bottom"}
    <ScrollArea.Root orientation="horizontal" class="bc-chart-switcher__scroll">
      <div class="bc-chart-switcher__tabs">
        <Tabs.List aria-label={ariaLabel}>
          {#each charts as chart (chart.id)}
            <Tabs.Trigger value={chart.id}>{chart.label || "All"}</Tabs.Trigger>
          {/each}
        </Tabs.List>
      </div>
    </ScrollArea.Root>
  {/if}
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
