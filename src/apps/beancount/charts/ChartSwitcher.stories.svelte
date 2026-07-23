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
    <div class="bg-card max-w-4xl rounded-xl border p-4 shadow-sm">
      <ChartSwitcher
        {charts}
        {activeChartId}
        onActiveChartChange={(id) => {
          activeChartId = id;
        }}
      >
        {#snippet children(activeId)}
          <div
            class="bg-muted/20 text-muted-foreground grid h-48 place-items-center rounded-lg border border-dashed text-sm"
          >
            {charts.find((chart) => chart.id === activeId)?.label} chart
          </div>
        {/snippet}
      </ChartSwitcher>
      <output class="sr-only" aria-live="polite">
        Active chart: {charts.find((chart) => chart.id === activeChartId)
          ?.label}
      </output>
    </div>
  {/snippet}
</Story>
