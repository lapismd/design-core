<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ChartModeSwitch from "./ChartModeSwitch.svelte";
  import LineChart from "./LineChart.svelte";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Charts/Line Chart",
    component: LineChart,
    parameters: {
      docs: {
        description: {
          component:
            "A responsive, model-driven time-series renderer. Provide display-ready values and colours from the application; this component owns the visual scales, line/area representation, accessible point focus, and empty state. It does not read ledger formatting or chart stores.",
        },
      },
    },
  });

  const series = [
    {
      id: "net-worth",
      label: "Net worth",
      color: "var(--ui-beancount-accent)",
      points: [
        {
          id: "may",
          date: "2026-05-01",
          label: "May 2026",
          value: 1240,
          valueLabel: "£1,240",
        },
        {
          id: "june",
          date: "2026-06-01",
          label: "June 2026",
          value: 1425,
          valueLabel: "£1,425",
        },
        {
          id: "july",
          date: "2026-07-01",
          label: "July 2026",
          value: 1510,
          valueLabel: "£1,510",
        },
      ],
    },
    {
      id: "savings",
      label: "Savings",
      color: "var(--ui-beancount-chart-series-comparison)",
      points: [
        {
          id: "may-savings",
          date: "2026-05-01",
          label: "May 2026",
          value: 810,
          valueLabel: "£810",
        },
        {
          id: "june-savings",
          date: "2026-06-01",
          label: "June 2026",
          value: 920,
          valueLabel: "£920",
        },
        {
          id: "july-savings",
          date: "2026-07-01",
          label: "July 2026",
          value: 980,
          valueLabel: "£980",
        },
      ],
    },
  ];

  const reportSeries = [
    {
      id: "balance",
      label: "Balance",
      color: "var(--ui-beancount-accent)",
      points: [
        {
          id: "october",
          date: "2024-10-01",
          label: "October",
          value: -480,
        },
        {
          id: "april",
          date: "2025-04-01",
          label: "April",
          value: -220,
        },
        {
          id: "october-next",
          date: "2025-10-01",
          label: "October",
          value: 300,
        },
      ],
    },
  ];
</script>

<script lang="ts">
  let mode = $state<"line" | "area">("line");
</script>

<Story
  name="Changes representation and exposes focused values"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Area" }));
    await expect(canvas.getByTestId("area-net-worth")).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "Net worth, July 2026: £1,510" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("July 2026");
    await userEvent.click(canvas.getByRole("tab", { name: "Line" }));
    await expect(canvas.getByRole("tab", { name: "Line" })).toHaveAttribute(
      "data-state",
      "active",
    );
  }}
>
  {#snippet template()}
    <div class="bc-line-chart-story">
      <div class="bc-line-chart-story__controls">
        <ChartModeSwitch
          value={mode}
          options={[
            { value: "line", label: "Line" },
            { value: "area", label: "Area" },
          ]}
          ariaLabel="Chart representation"
          onChange={(value) => {
            mode = value as "line" | "area";
          }}
        />
      </div>
      <LineChart
        {series}
        {mode}
        valueFormatter={(value) =>
          `£${Math.round(value).toLocaleString("en-GB")}`}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Uses a report axis for stepped balance history"
  play={async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("−600")).toBeVisible();
    await expect(canvas.getAllByText("October")).toHaveLength(2);
    await expect(
      canvasElement.querySelector(".bc-line-chart__grid-line"),
    ).toHaveAttribute("stroke-opacity", "0.2");
    await expect(
      canvas.getByRole("group", { name: "Stepped report balance" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-line-chart-story">
      <LineChart
        series={reportSeries}
        interpolation="step"
        chartWidth={560}
        chartHeight={240}
        xTickCount={3}
        valueDomain={{ min: -600, max: 600 }}
        yTickValues={[-600, -300, 0, 300, 600]}
        gridOpacity={0.2}
        valueFormatter={(value) => `${value < 0 ? "−" : ""}${Math.abs(value)}`}
        ariaLabel="Stepped report balance"
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Preserves ledger balances between postings"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("group", { name: "Stepped account balance" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-line-chart-story">
      <LineChart
        {series}
        interpolation="step"
        ariaLabel="Stepped account balance"
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Explains absent time-series data"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText("No balances match these filters."),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-line-chart-story">
      <LineChart series={[]} emptyLabel="No balances match these filters." />
    </div>
  {/snippet}
</Story>

<style>
  .bc-line-chart-story {
    max-width: 64rem;
    padding: var(--ui-beancount-space-5);
  }

  .bc-line-chart-story__controls {
    display: flex;
    justify-content: flex-end;
    margin-block-end: var(--ui-beancount-space-3);
  }
</style>
