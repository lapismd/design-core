<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import DashboardDonut from "./DashboardDonut.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Dashboard/Dashboard Donut",
    component: DashboardDonut,
    parameters: {
      docs: {
        description: {
          component:
            "A model-driven category donut. The application supplies categories, shared-theme colours, display-ready values, and any navigation action; this component owns the proportional arcs, centre feedback, focus interaction, and empty state.",
        },
      },
    },
  });

  const categories = [
    {
      id: "groceries",
      label: "Groceries",
      value: 420,
      valueLabel: "£420.00",
      color: "var(--chart-1)",
    },
    {
      id: "utilities",
      label: "Utilities",
      value: 180,
      valueLabel: "£180.00",
      color: "var(--chart-2)",
    },
  ];
</script>

<Story
  name="Highlights an outflow category"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Groceries: £420.00" }),
    );
    await expect(canvas.getByText("Groceries")).toBeVisible();
    await expect(canvas.getByText("£420.00")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-dashboard-donut-story">
      <DashboardDonut
        {categories}
        valueFormatter={(value) => `£${value.toFixed(2)}`}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Explains a period without outflows"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("No outflows in this period.")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-dashboard-donut-story">
      <DashboardDonut valueFormatter={(value) => String(value)} />
    </div>
  {/snippet}
</Story>

<style>
  .bc-dashboard-donut-story { max-width:28rem; border:1px solid var(--ui-beancount-border); border-radius:var(--ui-beancount-radius-panel); background:var(--ui-beancount-surface); box-shadow:var(--ui-beancount-shadow-panel); }
</style>
