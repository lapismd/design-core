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
      color: "var(--primary)",
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
    <div class="max-w-5xl p-5">
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
      <output class="sr-only" aria-live="polite">{selected}</output>
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
    <div class="max-w-5xl p-5">
      <DashboardTreeTable title="Assets" />
    </div>
  {/snippet}
</Story>
