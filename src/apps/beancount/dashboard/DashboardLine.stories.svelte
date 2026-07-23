<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import DashboardLine from "./DashboardLine.svelte";

  const { Story } = defineMeta({
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
    <div class="bg-card max-w-4xl rounded-xl border p-4 shadow-sm">
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
      <p class="sr-only" data-testid="selected-point">{selectedPoint}</p>
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
    <div class="bg-card max-w-4xl rounded-xl border p-4 shadow-sm">
      <DashboardLine
        points={[points[2]]}
        emptyLabel="A longer date range is needed to chart net worth."
        valueFormatter={(value) => `£${value.toFixed(2)}`}
      />
    </div>
  {/snippet}
</Story>
