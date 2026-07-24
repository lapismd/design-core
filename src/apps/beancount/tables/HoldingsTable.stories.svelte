<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import HoldingsTable from "./HoldingsTable.svelte";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Tables/Holdings Table",
    component: HoldingsTable,
    parameters: {
      docs: {
        description: {
          component:
            "A controlled Fava-style holdings table. Supply formatted holdings display values and current-page rows from an adapter; this component only handles presentation sorting and pagination controls.",
        },
      },
    },
  });

  const columns = [
    { id: "account", label: "account" },
    { id: "units", label: "units", align: "right" as const },
    { id: "cost", label: "cost", align: "right" as const },
    { id: "price", label: "price", align: "right" as const },
    { id: "book-value", label: "book_value", align: "right" as const },
    { id: "market-value", label: "market_value", align: "right" as const },
    {
      id: "acquisition-date",
      label: "acquisition_date",
      align: "right" as const,
    },
  ];

  const rows = [
    {
      id: "monzo",
      account: "Assets:Checking:Monzo",
      values: {
        units: { label: "7637.59 GBP", sortValue: 7637.59 },
        "book-value": { label: "7637.59 GBP", sortValue: 7637.59 },
        "market-value": { label: "7637.59 GBP", sortValue: 7637.59 },
      },
    },
    {
      id: "cash",
      account: "Assets:Cash",
      values: {
        units: { label: "70.00 GBP", sortValue: 70 },
        "book-value": { label: "70.00 GBP", sortValue: 70 },
        "market-value": { label: "70.00 GBP", sortValue: 70 },
      },
    },
    {
      id: "credit-card",
      account: "Liabilities:CreditCard",
      values: {
        units: { label: "−567.68 GBP", sortValue: -567.68 },
        "book-value": { label: "−567.68 GBP", sortValue: -567.68 },
        "market-value": { label: "−567.68 GBP", sortValue: -567.68 },
      },
    },
    {
      id: "loan",
      account: "Liabilities:Loan",
      values: {
        units: { label: "−20868.23 GBP", sortValue: -20868.23 },
        "book-value": { label: "−20868.23 GBP", sortValue: -20868.23 },
        "market-value": { label: "−20868.23 GBP", sortValue: -20868.23 },
      },
    },
  ];
</script>

<script lang="ts">
  let holdingsPage = $state(1);
  const holdingsPageSize = 2;

  const visibleRows = $derived(
    rows.slice(
      (holdingsPage - 1) * holdingsPageSize,
      holdingsPage * holdingsPageSize,
    ),
  );
  const resultLabel = $derived(
    `Showing ${(holdingsPage - 1) * holdingsPageSize + 1}–${Math.min(
      holdingsPage * holdingsPageSize,
      rows.length,
    )} of ${rows.length}`,
  );
</script>

<Story
  name="Sorts holdings display rows"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Sort by units" }),
    );
    await expect(
      canvas.getByRole("columnheader", { name: "units" }),
    ).toHaveAttribute("aria-sort", "ascending");
    await expect(canvas.getAllByRole("row")[1]).toHaveTextContent(
      "Assets:Cash",
    );
  }}
>
  {#snippet template()}
    <div class="bc-holdings-table-story">
      <HoldingsTable {columns} rows={rows.slice(0, 2)} />
    </div>
  {/snippet}
</Story>

<Story
  name="Changes controlled holdings pages"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Go to next page" }),
    );
    await expect(canvas.getByText("Liabilities:Loan")).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Showing 3–4 of 4",
    );
  }}
>
  {#snippet template()}
    <div class="bc-holdings-table-story">
      <HoldingsTable
        {columns}
        rows={visibleRows}
        pagination={{
          page: holdingsPage,
          pageCount: Math.ceil(rows.length / holdingsPageSize),
          resultLabel,
          pageSize: holdingsPageSize,
          pageSizes: [2, 4],
        }}
        onPageChange={(page) => {
          holdingsPage = page;
        }}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Frames an empty holdings state"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("No holdings in this report.")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-holdings-table-story">
      <HoldingsTable
        {columns}
        rows={[]}
        emptyLabel="No holdings in this report."
      />
    </div>
  {/snippet}
</Story>

<style>
  .bc-holdings-table-story {
    max-width: 80rem;
    padding: var(--ui-beancount-space-5);
  }
</style>
