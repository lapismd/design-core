<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ChartModeSwitch from "./ChartModeSwitch.svelte";
  import LineChart from "./LineChart.svelte";

  const { Story } = defineMeta({
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
      color: "var(--primary)",
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
      color: "var(--chart-2)",
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
