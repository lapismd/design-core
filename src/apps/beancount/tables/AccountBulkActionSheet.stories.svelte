<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, screen, userEvent } from "storybook/test";
  import AccountBulkActionSheet from "./AccountBulkActionSheet.svelte";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Tables/Account Bulk Action Sheet",
    component: AccountBulkActionSheet,
    parameters: {
      docs: {
        description: {
          component:
            "A presentational bulk-action sheet for selected ledger records. The application supplies account options and calculated change/duplicate summaries; this component owns only form layout, disclosure, accessible controls, and callbacks. See [UI Forms guidance](?path=/docs/ui-forms-guidance--docs) for the shared form contract.",
        },
      },
    },
  });

  const fromOptions = [
    { value: "Expenses:Dining", label: "Expenses:Dining" },
    { value: "Expenses:Groceries", label: "Expenses:Groceries" },
  ];
  const toOptions = [
    { value: "Expenses:Food", label: "Expenses:Food" },
    { value: "Expenses:Groceries", label: "Expenses:Groceries" },
    { value: "Expenses:Household", label: "Expenses:Household" },
  ];
</script>

<script lang="ts">
  let open = $state(true);
  let fromAccount = $state("Expenses:Dining");
  let toAccount = $state("Expenses:Food");
  let result = $state("");
</script>

<Story
  name="Applies a selection and manages disclosures"
  play={async () => {
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    await expect(screen.getByRole("status")).toHaveTextContent(
      "Replacing Expenses:Dining with Expenses:Food",
    );

    await userEvent.click(screen.getByRole("button", { name: "Collapse all" }));
    await expect(
      screen.queryByRole("button", { name: "Apply" }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Expand all" }));
    await expect(
      screen.getByRole("button", { name: "Delete duplicate records" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-account-bulk-sheet-story">
      <AccountBulkActionSheet
        bind:open
        recordCount={6}
        bind:fromAccount
        bind:toAccount
        {fromOptions}
        {toOptions}
        status={result}
        replacement={{ changedCount: 3, skippedCount: 1 }}
        duplicates={{
          groupCount: 1,
          deleteCount: 2,
          keepCount: 1,
          skippedCount: 1,
        }}
        onApplyReplacement={({ fromAccount, toAccount }) => {
          result = `Replacing ${fromAccount} with ${toAccount}`;
        }}
        onDeleteDuplicates={() => {
          result = "Deleting 2 duplicate records";
        }}
      />
    </div>
  {/snippet}
</Story>

<style>
  .bc-account-bulk-sheet-story {
    height: 42rem;
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: var(--ui-beancount-surface);
    box-shadow: var(--ui-beancount-shadow-panel);
  }
</style>
