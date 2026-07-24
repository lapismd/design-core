<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ScatterPlot from "./ScatterPlot.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Charts/Scatter Plot",
    component: ScatterPlot,
    parameters: {
      docs: {
        description: {
          component:
            "A model-driven event plot. The application supplies event categories, display-ready dates, colours, and any route action; this renderer owns responsive placement, accessible point focus, and the empty state without reading Fava stores.",
        },
      },
    },
  });

  const points = [
    {
      id: "groceries",
      date: "2026-05-12",
      dateLabel: "12 May",
      category: "Transaction",
      label: "Groceries",
      detail: "£42.17 at Northstar Market",
      color: "var(--ui-beancount-accent)",
    },
    {
      id: "utility",
      date: "2026-06-03",
      dateLabel: "3 Jun",
      category: "Transaction",
      label: "Utility bill",
      detail: "£86.00 recurring payment",
      color: "var(--ui-beancount-accent)",
    },
    {
      id: "document",
      date: "2026-06-19",
      dateLabel: "19 Jun",
      category: "Document",
      label: "Statement imported",
      detail: "Northstar Card",
      color: "var(--ui-beancount-chart-series-comparison)",
    },
  ];
</script>

<Story
  name="Focuses ledger events"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Statement imported, Document, 19 Jun, Northstar Card",
      }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Statement imported",
    );
  }}
>
  {#snippet template()}
    <div class="bc-scatter-plot-story">
      <ScatterPlot {points} />
    </div>
  {/snippet}
</Story>

<Story
  name="Explains absent event data"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("No matching events.")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-scatter-plot-story">
      <ScatterPlot points={[]} emptyLabel="No matching events." />
    </div>
  {/snippet}
</Story>

<style>
  .bc-scatter-plot-story {
    max-width: 64rem;
    padding: var(--ui-beancount-space-5);
  }
</style>
