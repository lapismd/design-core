<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import ChartPanel from "./ChartPanel.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Charts/Chart Panel",
    component: ChartPanel,
    parameters: {
      docs: {
        description: {
          component:
            "A controlled chart toolbar and rendering frame. It places series visibility, compact display settings, and alternate representations around a model-driven chart while the application retains data derivation, value formatting, and navigation.",
        },
      },
    },
  });

  const series = [
    {
      id: "gbp",
      label: "GBP",
      color: "#6750c5",
      points: [
        {
          id: "gbp-may",
          date: "2026-05-01",
          label: "May 2026",
          value: 1240,
          valueLabel: "£1,240.00",
        },
        {
          id: "gbp-jun",
          date: "2026-06-01",
          label: "June 2026",
          value: 1425,
          valueLabel: "£1,425.00",
        },
        {
          id: "gbp-jul",
          date: "2026-07-01",
          label: "July 2026",
          value: 1510,
          valueLabel: "£1,510.00",
        },
      ],
    },
    {
      id: "usd",
      label: "USD",
      color: "#087f5b",
      points: [
        {
          id: "usd-may",
          date: "2026-05-01",
          label: "May 2026",
          value: 980,
          valueLabel: "$980.00",
        },
        {
          id: "usd-jun",
          date: "2026-06-01",
          label: "June 2026",
          value: 1030,
          valueLabel: "$1,030.00",
        },
        {
          id: "usd-jul",
          date: "2026-07-01",
          label: "July 2026",
          value: 1065,
          valueLabel: "$1,065.00",
        },
      ],
    },
  ];
</script>

<script lang="ts">
  import LineChart from "./LineChart.svelte";

  let selectedSeries = $state(["gbp", "usd"]);
  let conversion = $state("cost");
  let interval = $state("month");
  let mode = $state("line");

  const conversionOptions = [
    { value: "cost", label: "At cost" },
    { value: "market", label: "At market value" },
    { value: "units", label: "Units" },
  ];
  const intervalOptions = [
    { value: "year", label: "Yearly" },
    { value: "quarter", label: "Quarterly" },
    { value: "month", label: "Monthly" },
  ];
  const modeOptions = [
    { value: "line", label: "Line chart" },
    { value: "area", label: "Area map" },
  ];

  const visibleSeries = $derived(
    series.filter((item) => selectedSeries.includes(item.id)),
  );
  const conversionLabel = $derived(
    conversionOptions.find((option) => option.value === conversion)?.label,
  );
  const intervalLabel = $derived(
    intervalOptions.find((option) => option.value === interval)?.label,
  );
  const modeLabel = $derived(
    modeOptions.find((option) => option.value === mode)?.label,
  );
</script>

<Story
  name="Coordinates chart controls with a rendered visual"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Toggle USD" }));
    await expect(canvas.getByTestId("chart-panel-state")).toHaveTextContent(
      "Visible series: GBP",
    );

    await userEvent.click(canvas.getByRole("button", { name: "Conversion" }));
    await userEvent.click(
      within(document.body).getByRole("option", { name: "At market value" }),
    );
    await expect(canvas.getByTestId("chart-panel-state")).toHaveTextContent(
      "At market value",
    );

    await userEvent.click(canvas.getByRole("tab", { name: "Area map" }));
    await expect(canvas.getByTestId("chart-panel-state")).toHaveTextContent(
      "Area map",
    );
  }}
>
  {#snippet template()}
    <div class="bc-chart-panel-story">
      <ChartPanel
        legend={{
          items: [
            { id: "gbp", label: "GBP", color: "#6750c5" },
            { id: "usd", label: "USD", color: "#087f5b" },
          ],
          selectedIds: selectedSeries,
          onSelectedIdsChange: (ids) => {
            selectedSeries = ids;
          },
        }}
        conversion={{
          ariaLabel: "Conversion",
          value: conversion,
          options: conversionOptions,
          onChange: (value) => {
            conversion = value;
          },
        }}
        interval={{
          ariaLabel: "Interval",
          value: interval,
          options: intervalOptions,
          onChange: (value) => {
            interval = value;
          },
        }}
        modes={{
          value: mode,
          options: modeOptions,
          onChange: (value) => {
            mode = value;
          },
        }}
      >
        {#snippet children()}
          <LineChart
            series={visibleSeries}
            mode={mode === "area" ? "area" : "line"}
            ariaLabel="Net worth over time"
          />
        {/snippet}
      </ChartPanel>
      <output
        data-testid="chart-panel-state"
        class="bc-chart-panel-story__status"
        aria-live="polite"
      >
        Visible series: {visibleSeries.map((item) => item.label).join(", ") ||
          "None"}. {conversionLabel}, {intervalLabel}, {modeLabel}
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Frames a focused chart without controls">
  {#snippet template()}
    <div class="bc-chart-panel-story">
      <ChartPanel ariaLabel="Focused net worth chart">
        {#snippet children()}
          <LineChart series={[series[0]]} ariaLabel="Net worth over time" />
        {/snippet}
      </ChartPanel>
    </div>
  {/snippet}
</Story>

<style>
  .bc-chart-panel-story {
    max-width: 64rem;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--card);
    padding: var(--ui-beancount-space-5);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-chart-panel-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
