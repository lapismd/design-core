<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import DashboardFlow from "./DashboardFlow.svelte";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Dashboard/Dashboard Flow",
    component: DashboardFlow,
    parameters: {
      docs: {
        description: {
          component:
            "A model-driven cash-flow renderer. The application supplies categorized inflows, outflows, and navigation callbacks; the component balances surplus or deficit, lays out proportional streams, exposes keyboard focus, and renders the empty state without reading ledger or route state.",
        },
      },
    },
  });

  const inflows = [
    {
      id: "income-salary",
      label: "Salary",
      value: 3400,
      color: "var(--ui-beancount-dashboard-series-indigo)",
    },
    {
      id: "income-refunds",
      label: "Refunds",
      value: 120,
      color: "var(--ui-beancount-dashboard-series-orange)",
    },
  ];

  const outflows = [
    {
      id: "expenses-groceries",
      label: "Groceries",
      value: 420,
      color: "var(--ui-beancount-dashboard-series-cyan)",
    },
    {
      id: "expenses-rent",
      label: "Rent",
      value: 1300,
      color: "var(--ui-beancount-dashboard-series-green)",
    },
  ];
</script>

<script lang="ts">
  let selectedCategory = $state("No category selected");
</script>

<Story
  name="Activates a cash-flow category"
  play={async ({ canvas }) => {
    const salary = canvas.getByRole("button", {
      name: "Salary to Cash flow: £3,400.00",
    });
    await userEvent.click(salary);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Salary → Cash flow",
    );
    await expect(canvas.getByTestId("selected-category")).toHaveTextContent(
      "Salary",
    );
  }}
>
  {#snippet template()}
    <div class="bc-dashboard-flow-story">
      <DashboardFlow
        {inflows}
        {outflows}
        valueFormatter={(value) =>
          `£${value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        onCategorySelect={(category) => {
          selectedCategory = `Selected: ${category.label}`;
        }}
      />
      <p
        class="bc-dashboard-flow-story__status"
        data-testid="selected-category"
      >
        {selectedCategory}
      </p>
    </div>
  {/snippet}
</Story>

<Story
  name="Explains a period without cash flow"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText("No cash-flow activity matches this period."),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-dashboard-flow-story">
      <DashboardFlow valueFormatter={(value) => String(value)} />
    </div>
  {/snippet}
</Story>

<style>
  .bc-dashboard-flow-story {
    max-width: 64rem;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface);
    box-shadow: var(--ui-beancount-shadow-panel);
  }
  .bc-dashboard-flow-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
