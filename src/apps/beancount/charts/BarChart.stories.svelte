<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import BarChart from "./BarChart.svelte";
  import ChartModeSwitch from "./ChartModeSwitch.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Charts/Bar Chart",
    component: BarChart,
    parameters: {
      docs: {
        description: {
          component:
            "A responsive, model-driven grouped or diverging stacked bar chart. The application prepares interval labels, preformatted values, colours, budgets, account/category stacks, and route actions; this renderer owns visual scale, accessible bar focus, and empty state.",
        },
      },
    },
  });

  const groups = [
    {
      id: "may",
      label: "May",
      values: [
        {
          id: "gbp",
          label: "GBP spending",
          value: -420,
          valueLabel: "−£420",
          budget: -400,
          budgetLabel: "−£400 budget",
          color: "var(--primary)",
        },
        {
          id: "eur",
          label: "EUR spending",
          value: -95,
          valueLabel: "−€95",
          color: "var(--chart-2)",
        },
      ],
      stacks: [
        {
          id: "groceries-may",
          label: "Expenses:Groceries",
          value: -300,
          valueLabel: "−£300",
          color: "var(--primary)",
        },
        {
          id: "utilities-may",
          label: "Expenses:Utilities",
          value: -120,
          valueLabel: "−£120",
          color: "var(--chart-2)",
        },
      ],
    },
    {
      id: "june",
      label: "June",
      values: [
        {
          id: "gbp-june",
          label: "GBP spending",
          value: -385,
          valueLabel: "−£385",
          budget: -400,
          budgetLabel: "−£400 budget",
          color: "var(--primary)",
        },
        {
          id: "eur-june",
          label: "EUR spending",
          value: -74,
          valueLabel: "−€74",
          color: "var(--chart-2)",
        },
      ],
      stacks: [
        {
          id: "groceries-june",
          label: "Expenses:Groceries",
          value: -275,
          valueLabel: "−£275",
          color: "var(--primary)",
        },
        {
          id: "utilities-june",
          label: "Expenses:Utilities",
          value: -110,
          valueLabel: "−£110",
          color: "var(--chart-2)",
        },
      ],
    },
  ];
</script>

<script lang="ts">
  let mode = $state<"single" | "stacked">("single");
</script>

<Story
  name="Changes representation and focuses bars"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Stacked" }));
    await expect(
      canvas.getByRole("button", {
        name: "Expenses:Groceries, June: −£275",
      }),
    ).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", {
        name: "Expenses:Groceries, June: −£275",
      }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("June");
  }}
>
  {#snippet template()}
    <div class="max-w-5xl p-5">
      <div class="mb-3 flex justify-end">
        <ChartModeSwitch
          value={mode}
          options={[
            { value: "single", label: "Single" },
            { value: "stacked", label: "Stacked" },
          ]}
          ariaLabel="Bar representation"
          onChange={(value) => {
            mode = value as "single" | "stacked";
          }}
        />
      </div>
      <BarChart
        {groups}
        {mode}
        valueFormatter={(value) => `${value < 0 ? "−" : ""}${Math.abs(value)}`}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Explains absent bar data"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText("No spending matches these filters."),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="max-w-5xl p-5">
      <BarChart groups={[]} emptyLabel="No spending matches these filters." />
    </div>
  {/snippet}
</Story>
