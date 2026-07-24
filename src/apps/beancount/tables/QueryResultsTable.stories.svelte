<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import QueryResultsTable from "./QueryResultsTable.svelte";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Tables/Query Results Table",
    component: QueryResultsTable,
    parameters: {
      docs: {
        description: {
          component:
            "A formatted, client-sortable query result table. Supply precomputed display values and controlled page ranges from the query layer; this visual primitive intentionally does not parse BQL or infer account and money formatting.",
        },
      },
    },
  });

  const columns = [
    { id: "date", label: "Date", sortable: true },
    { id: "description", label: "Description", sortable: true },
    { id: "account", label: "Account" },
    { id: "amount", label: "Amount", sortable: true, align: "right" as const },
  ];

  const rows = [
    {
      id: "groceries",
      values: {
        date: "18 Jul 2026",
        description: "Groceries",
        account: "Expenses:Groceries",
        amount: "-42.17",
      },
    },
    {
      id: "refund",
      values: {
        date: "17 Jul 2026",
        description: "Alpha refund",
        account: ["Assets:Cash", "Income:Refunds"],
        amount: "12.50",
      },
    },
    {
      id: "utilities",
      values: {
        date: "16 Jul 2026",
        description: "Household utilities",
        account: "Expenses:Utilities",
        amount: "-86.55",
      },
    },
    {
      id: "salary",
      values: {
        date: "15 Jul 2026",
        description: "Salary payment",
        account: "Income:Salary",
        amount: "3200.00",
      },
    },
  ];
</script>

<script lang="ts">
  let queryPage = $state(1);
  let queryPageSize = $state(2);

  function visibleRows() {
    const start = (queryPage - 1) * queryPageSize;
    return rows.slice(start, start + queryPageSize);
  }

  function resultLabel() {
    const start = (queryPage - 1) * queryPageSize + 1;
    const end = Math.min(queryPage * queryPageSize, rows.length);
    return `Showing ${start}–${end} of ${rows.length}`;
  }
</script>

<Story
  name="Sorts formatted query rows"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Sort by Description" }),
    );
    await expect(
      canvas.getByRole("columnheader", { name: "Description" }),
    ).toHaveAttribute("aria-sort", "ascending");
    await expect(canvas.getAllByRole("row")[1]).toHaveTextContent(
      "Alpha refund",
    );
  }}
>
  {#snippet template()}
    <div class="bc-query-results-story">
      <QueryResultsTable {columns} rows={rows.slice(0, 2)} />
    </div>
  {/snippet}
</Story>

<Story
  name="Changes controlled query pages"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Go to next page" }),
    );
    await expect(canvas.getByText("Household utilities")).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Showing 3–4 of 4",
    );
  }}
>
  {#snippet template()}
    <div class="bc-query-results-story">
      <QueryResultsTable
        {columns}
        rows={visibleRows()}
        pagination={{
          page: queryPage,
          pageCount: Math.ceil(rows.length / queryPageSize),
          resultLabel: resultLabel(),
          pageSize: queryPageSize,
          pageSizes: [2, 4],
        }}
        onPageChange={(page) => {
          queryPage = page;
        }}
        onPageSizeChange={(pageSize) => {
          queryPageSize = pageSize;
          queryPage = 1;
        }}
      />
      <output class="bc-query-results-story__status" aria-live="polite"
        >{resultLabel()}</output
      >
    </div>
  {/snippet}
</Story>

<Story
  name="Keeps a query failure actionable"
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Unexpected token near FROM",
    );
  }}
>
  {#snippet template()}
    <div class="bc-query-results-story">
      <QueryResultsTable
        {columns}
        rows={[]}
        emptyLabel="No matching rows."
        error="Unexpected token near FROM"
      />
    </div>
  {/snippet}
</Story>

<style>
  .bc-query-results-story {
    max-width: 64rem;
    padding: var(--ui-beancount-space-5);
  }

  .bc-query-results-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
