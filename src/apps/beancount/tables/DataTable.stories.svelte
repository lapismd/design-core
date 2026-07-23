<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import type { ColumnDef } from "@tanstack/table-core";
  import DataTable from "./DataTable.svelte";

  type Transaction = {
    date: string;
    description: string;
    account: string;
    amount: string;
  };

  const columns: ColumnDef<Transaction>[] = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "account", header: "Account" },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: (info) => info.getValue<string>(),
    },
  ];

  const transactions: Transaction[] = [
    {
      date: "18 Jul 2026",
      description: "Groceries",
      account: "Expenses:Groceries",
      amount: "£42.17",
    },
    {
      date: "17 Jul 2026",
      description: "Salary",
      account: "Income:Salary",
      amount: "£3,200.00",
    },
  ];

  const { Story } = defineMeta({
    title: "Apps/Beancount/Tables/Data Table",
    component: DataTable,
    parameters: {
      docs: {
        description: {
          component:
            "A typed TanStack Table composition for fixed-column application collections. Use it for ordinary data grids; domain-specific journal, query, and tree tables retain their own interaction contracts.",
        },
      },
    },
  });
</script>

<Story
  name="Renders typed ledger rows"
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("table")).toBeVisible();
    await expect(canvas.getByText("Groceries")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-data-table-story">
      <DataTable data={transactions} {columns} />
    </div>
  {/snippet}
</Story>

<Story
  name="Shows an empty result state"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("No matching transactions.")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-data-table-story">
      <DataTable data={[]} {columns} emptyLabel="No matching transactions." />
    </div>
  {/snippet}
</Story>

<style>
  .bc-data-table-story {
    max-width: 48rem;
  }
</style>
