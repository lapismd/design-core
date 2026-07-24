<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import DashboardTreeTable from "./DashboardTreeTable.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Dashboard/Dashboard Tree Table",
    component: DashboardTreeTable,
    parameters: {
      docs: {
        description: {
          component:
            "An expandable account summary with an aggregate contribution legend, proportional weight meters, and a horizontally safe value grid. Supply a display-ready tree and callbacks for account navigation; this component never reads a ledger, formatter context, or route.",
        },
      },
    },
  });

  const nodes = [
    {
      id: "assets",
      label: "Assets",
      value: 14120,
      color: "var(--ui-beancount-accent)",
      children: [
        {
          id: "assets-cash",
          label: "Cash",
          value: 2120,
          color: "var(--chart-2)",
          children: [
            {
              id: "assets-cash-wallet",
              label: "Wallet",
              value: 120,
              color: "var(--chart-2)",
            },
            {
              id: "assets-cash-current",
              label: "Current account",
              value: 2000,
              color: "var(--chart-2)",
            },
          ],
        },
        {
          id: "assets-investments",
          label: "Investments",
          value: 12000,
          color: "var(--chart-1)",
        },
      ],
    },
  ];

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(value);
</script>

<script lang="ts">
  let selected = $state("No account selected");
</script>

<Story
  name="Collapses account branches and reports navigation"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse Assets" }),
    );
    await expect(
      canvas.queryByRole("button", { name: "Cash" }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole("button", { name: "Expand Assets" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Cash" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Selected Cash");
  }}
>
  {#snippet template()}
    <div class="bc-dashboard-tree-table-story">
      <DashboardTreeTable
        {nodes}
        title="Assets"
        valueFormatter={formatAmount}
        onNodeSelect={(node) => {
          selected = `Selected ${node.label}`;
        }}
        onViewAll={() => {
          selected = "Selected all assets";
        }}
      />
      <output class="bc-dashboard-tree-table-story__status" aria-live="polite"
        >{selected}</output
      >
    </div>
  {/snippet}
</Story>

<Story
  name="Explains an empty account group"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText("No accounts match this period."),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-dashboard-tree-table-story">
      <DashboardTreeTable title="Assets" />
    </div>
  {/snippet}
</Story>

<style>
  .bc-dashboard-tree-table-story {
    max-inline-size: 64rem;
    padding: var(--ui-beancount-space-5);
  }
  .bc-dashboard-tree-table-story__status {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
