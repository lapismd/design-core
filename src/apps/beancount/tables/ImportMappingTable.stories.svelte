<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, screen, userEvent, within } from "storybook/test";
  import ImportMappingTable, {
    type ImportMappingRow,
  } from "./ImportMappingTable.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Tables/Import Mapping Table",
    component: ImportMappingTable,
    parameters: {
      docs: {
        description: {
          component:
            "A controlled, presentation-only import mapping table. It renders pre-parsed rows and account choices, and reports account, source-editor, reset, and tab actions to the application. File parsing, inferred matches, directive rewrites, persistence, and upload workflows remain application responsibilities during the migration.",
        },
      },
    },
  });

  const columns = [
    { id: "date", label: "Date" },
    { id: "description", label: "Description" },
    { id: "amount", label: "Amount", align: "right" as const },
  ];
  const accountOptions = [
    { value: "Assets:Cash", label: "Assets:Cash", description: "Cash on hand" },
    {
      value: "Expenses:Dining",
      label: "Expenses:Dining",
      description: "Meals and coffee",
    },
    {
      value: "Expenses:Groceries",
      label: "Expenses:Groceries",
      description: "Food and household shopping",
    },
  ];
  const initialCategorizedRows: ImportMappingRow[] = [
    {
      id: "groceries",
      label: "Groceries",
      account: "Expenses:Groceries",
      values: {
        date: "18 Jul 2026",
        description: "Groceries",
        amount: "−£42.17",
      },
    },
  ];
  const initialUncategorizedRows: ImportMappingRow[] = [
    {
      id: "coffee",
      label: "Coffee Shop",
      account: "",
      accountHint: "Choose an expense account before importing this row.",
      values: {
        date: "17 Jul 2026",
        description: "Coffee Shop",
        amount: "−£3.20",
      },
    },
  ];
</script>

<script lang="ts">
  let activeTab = $state<"categorized" | "uncategorized">("categorized");
  let categorizedRows = $state<ImportMappingRow[]>(initialCategorizedRows);
  let uncategorizedRows = $state<ImportMappingRow[]>(initialUncategorizedRows);
  let status = $state("Ready to map imported rows.");

  function updateAccount(row: ImportMappingRow, account: string) {
    const updated = { ...row, account, accountHint: undefined };
    uncategorizedRows = uncategorizedRows.map((candidate) =>
      candidate.id === row.id ? updated : candidate,
    );
    categorizedRows = [...categorizedRows, updated];
    uncategorizedRows = uncategorizedRows.filter(
      (candidate) => candidate.id !== row.id,
    );
    activeTab = "categorized";
    status = `${row.label} mapped to ${account}`;
  }
</script>

<Story
  name="Maps rows, opens source, and confirms reset"
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(
      canvas.getByRole("tab", { name: "Needs account (1)" }),
    );
    await expect(canvas.getByText("Coffee Shop")).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "Account for Coffee Shop" }),
    );
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      page.getByRole("option", { name: /Expenses:Dining/ }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Coffee Shop mapped to Expenses:Dining",
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Edit source for Groceries" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Opening source for Groceries",
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Reset mapping" }),
    );
    await expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "Reset import mapping?",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Confirm reset" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Mapping reset");
  }}
>
  {#snippet template()}
    <div class="bc-import-mapping-story">
      <ImportMappingTable
        fileName="northstar-july.csv"
        {columns}
        {categorizedRows}
        {uncategorizedRows}
        {accountOptions}
        {activeTab}
        onActiveTabChange={(tab) => {
          activeTab = tab;
        }}
        onAccountChange={updateAccount}
        onOpenSource={(row) => {
          status = `Opening source for ${row.label}`;
        }}
        onReset={() => {
          status = "Mapping reset";
        }}
      />
      <output
        class="bc-import-mapping-story__status"
        aria-live="polite"
      >
        {status}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Explains an empty import category"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText("Every imported row has an account."),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-import-mapping-story">
      <ImportMappingTable
        fileName="empty.csv"
        {columns}
        categorizedRows={[]}
        uncategorizedRows={[]}
        {accountOptions}
        activeTab="uncategorized"
      />
    </div>
  {/snippet}
</Story>

<style>
  .bc-import-mapping-story {
    max-width: 72rem;
    padding: var(--ui-beancount-space-5);
  }

  .bc-import-mapping-story__status {
    display: block;
    margin-block-start: var(--ui-beancount-space-3);
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.875rem;
  }
</style>
