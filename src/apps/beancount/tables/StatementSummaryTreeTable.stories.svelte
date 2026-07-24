<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import StatementSummaryTreeTable from "./StatementSummaryTreeTable.svelte";

  const columns = [{ id: "gbp", label: "GBP", title: "Pounds sterling" }];
  const nodes = [
    {
      id: "assets",
      label: "Assets",
      href: "/accounts/Assets",
      values: { gbp: "£1,510.00" },
      weight: "100.0%",
      color: "var(--ui-beancount-accent)",
      children: [
        {
          id: "assets-cash",
          label: "Cash",
          href: "/accounts/Assets:Cash",
          values: { gbp: "£510.00" },
          weight: "33.8%",
          color: "var(--chart-2)",
        },
        {
          id: "assets-bank",
          label: "Bank",
          href: "/accounts/Assets:Bank",
          values: { gbp: "£1,000.00" },
          weight: "66.2%",
          color: "var(--chart-3)",
          otherValues: [{ label: "USD", value: "$50.00", title: "US dollars" }],
        },
      ],
    },
  ];

  const contributions = [
    {
      id: "cash",
      label: "Assets:Cash",
      percentage: 33.8,
      amount: "£510.00",
      color: "var(--chart-2)",
    },
    {
      id: "bank",
      label: "Assets:Bank",
      percentage: 66.2,
      amount: "£1,000.00",
      color: "var(--chart-3)",
    },
  ];

  const { Story } = defineMeta({
    title: "Apps/Beancount/Tables/Statement Summary Tree Table",
    component: StatementSummaryTreeTable,
    parameters: {
      docs: {
        description: {
          component:
            "A display-model-driven financial statement hierarchy with contribution context, weight meters, multi-currency values, and accessible account disclosure. Applications derive, format, filter, and route their account data before passing it to this component.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let selectedAccount = $state("");
</script>

<Story
  name="Collapses and expands the account hierarchy"
  play={async ({ canvas }) => {
    const collapseAll = canvas.getByRole("button", {
      name: "Collapse all accounts",
    });
    await userEvent.click(collapseAll);
    await expect(collapseAll).toHaveAttribute("aria-pressed", "true");
    await expect(
      canvas.queryByRole("link", { name: "Cash" }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole("button", { name: "Expand all accounts" }),
    );
    await expect(canvas.getByRole("link", { name: "Cash" })).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bj-statement-summary-story">
      <StatementSummaryTreeTable
        title="Assets"
        total="£1,510.00"
        href="/accounts/Assets"
        {nodes}
        {columns}
        {contributions}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Reports selected accounts"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("link", { name: "Bank" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Selected Bank");
  }}
>
  {#snippet template()}
    <div class="bj-statement-summary-story">
      <StatementSummaryTreeTable
        title="Assets"
        total="£1,510.00"
        {nodes}
        {columns}
        {contributions}
        onNavigate={(node) => {
          selectedAccount = node.label;
        }}
      />
      <output class="bj-statement-summary-story__status" aria-live="polite">
        {selectedAccount
          ? `Selected ${selectedAccount}`
          : "No account selected"}
      </output>
    </div>
  {/snippet}
</Story>

<style>
  .bj-statement-summary-story {
    max-width: 64rem;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: var(--ui-beancount-surface);
    padding: var(--ui-beancount-space-5);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bj-statement-summary-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
