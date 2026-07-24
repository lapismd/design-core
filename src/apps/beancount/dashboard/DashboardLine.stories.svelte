<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import DashboardLine from "./DashboardLine.svelte";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Dashboard/Dashboard Line",
    component: DashboardLine,
    parameters: {
      docs: {
        description: {
          component:
            "A keyboard-explorable dashboard trend. The application supplies its display-ready points, values, trend direction, and any follow-up action; the renderer owns visual interpolation, pointer and keyboard exploration, accessible slider feedback, and the empty state.",
        },
      },
    },
  });

  const points = [
    {
      id: "may",
      date: new Date("2026-05-01"),
      label: "01 May 2026",
      value: 1240,
      valueLabel: "£1,240.00",
    },
    {
      id: "june",
      date: new Date("2026-06-01"),
      label: "01 Jun 2026",
      value: 1425,
      valueLabel: "£1,425.00",
    },
    {
      id: "july",
      date: new Date("2026-07-01"),
      label: "01 Jul 2026",
      value: 1510,
      valueLabel: "£1,510.00",
    },
  ];
</script>

<script lang="ts">
  let selectedPoint = $state("No point selected");
</script>

<Story
  name="Explores a positive trend with the keyboard"
  play={async ({ canvas }) => {
    const chart = canvas.getByRole("slider", {
      name: "Explore net worth by date",
    });
    chart.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(chart).toHaveAttribute("aria-valuenow", "1");
    await expect(canvas.getByRole("status")).toHaveTextContent("£1,425.00");
    await expect(canvas.getByTestId("selected-point")).toHaveTextContent(
      "01 Jun 2026",
    );
  }}
>
  {#snippet template()}
    <div class="bc-dashboard-line-story">
      <DashboardLine
        {points}
        change={270}
        ariaLabel="Explore net worth by date"
        chartLabel="Net worth over time"
        valueFormatter={(value) => `£${value.toFixed(2)}`}
        onPointFocus={(point) => {
          selectedPoint = `Selected: ${point.label}`;
        }}
      />
      <p class="bc-dashboard-line-story__status" data-testid="selected-point">{selectedPoint}</p>
    </div>
  {/snippet}
</Story>

<Story
  name="Explains when a longer history is needed"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText("A longer date range is needed to chart net worth."),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-dashboard-line-story">
      <DashboardLine
        points={[points[2]]}
        emptyLabel="A longer date range is needed to chart net worth."
        valueFormatter={(value) => `£${value.toFixed(2)}`}
      />
    </div>
  {/snippet}
</Story>

<style>
  .bc-dashboard-line-story { max-width:56rem; border:1px solid var(--ui-beancount-border); border-radius:var(--ui-beancount-radius-panel); background:var(--ui-beancount-surface); padding:var(--ui-beancount-space-4); box-shadow:var(--ui-beancount-shadow-panel); }
  .bc-dashboard-line-story__status { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
</style>
