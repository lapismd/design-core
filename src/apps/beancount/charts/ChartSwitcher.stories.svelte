<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ChartSwitcher from "./ChartSwitcher.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Charts/Chart Switcher",
    component: ChartSwitcher,
    parameters: {
      docs: {
        description: {
          component:
            "A responsive, controlled perspective selector for related charts. It owns the tab strip and horizontal overflow treatment; the parent supplies the active chart's rendered data.",
        },
      },
    },
  });

  const charts = [
    { id: "net-worth", label: "Net worth" },
    { id: "monthly-spending", label: "Monthly spending" },
  ];
</script>

<script lang="ts">
  let activeChartId = $state("net-worth");
</script>

<Story
  name="Switches between chart perspectives"
  play={async ({ canvas }) => {
    const spending = canvas.getByRole("tab", { name: "Monthly spending" });
    await userEvent.click(spending);
    await expect(spending).toHaveAttribute("data-state", "active");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Monthly spending",
    );
  }}
>
  {#snippet template()}
    <div class="bc-chart-switcher-story">
      <ChartSwitcher
        {charts}
        {activeChartId}
        tabsPlacement="top"
        onActiveChartChange={(id) => {
          activeChartId = id;
        }}
      >
        {#snippet children(activeId)}
          <div class="bc-chart-switcher-story__canvas">
            {charts.find((chart) => chart.id === activeId)?.label} chart
          </div>
        {/snippet}
      </ChartSwitcher>
      <output class="bc-chart-switcher-story__status" aria-live="polite">
        Active chart: {charts.find((chart) => chart.id === activeChartId)
          ?.label}
      </output>
    </div>
  {/snippet}
</Story>

<style>
  .bc-chart-switcher-story {
    max-width: 56rem;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface);
    padding: var(--ui-beancount-space-4);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-chart-switcher-story__canvas {
    display: grid;
    height: 12rem;
    place-items: center;
    border: 1px dashed var(--ui-beancount-border);
    border-radius: var(--radius-lg);
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 20%,
      transparent
    );
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }

  .bc-chart-switcher-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
