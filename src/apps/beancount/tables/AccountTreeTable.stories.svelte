<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import AccountTreeTable from "./AccountTreeTable.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Tables/Account Tree Table",
    component: AccountTreeTable,
    parameters: {
      docs: {
        description: {
          component:
            "A controlled-data account hierarchy with per-column values and accessible row disclosure. It replaces application-store coupling with a plain tree model; use it for report surfaces that need expandable account groups, not a bespoke indented list.",
        },
      },
    },
  });

  const columns = [{ id: "gbp", label: "GBP", title: "Pounds sterling" }];
  const nodes = [
    {
      id: "assets",
      label: "Assets",
      href: "/accounts/Assets",
      values: { gbp: 1510 },
      children: [
        {
          id: "assets-cash",
          label: "Cash",
          href: "/accounts/Assets:Cash",
          values: { gbp: 510 },
        },
        {
          id: "assets-bank",
          label: "Bank",
          href: "/accounts/Assets:Bank",
          values: { gbp: 1000 },
        },
      ],
    },
  ];
</script>

<script lang="ts">
  let selectedAccount = $state("");
</script>

<Story
  name="Folds and unfolds the account hierarchy"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse all accounts" }),
    );
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
    <div class="bc-account-tree-table-story">
      <AccountTreeTable
        {nodes}
        {columns}
        formatValue={(value) =>
          typeof value === "number"
            ? new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: "GBP",
              }).format(value)
            : String(value ?? "—")}
        onNavigate={(node) => {
          selectedAccount = node.label;
        }}
      />
      <output class="bc-account-tree-table-story__status" aria-live="polite">
        {selectedAccount
          ? `Selected ${selectedAccount}`
          : "No account selected"}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Reports the selected account"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("link", { name: "Bank" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Selected Bank");
  }}
>
  {#snippet template()}
    <div class="bc-account-tree-table-story">
      <AccountTreeTable
        {nodes}
        {columns}
        onNavigate={(node) => {
          selectedAccount = node.label;
        }}
      />
      <output class="bc-account-tree-table-story__status" aria-live="polite">
        {selectedAccount
          ? `Selected ${selectedAccount}`
          : "No account selected"}
      </output>
    </div>
  {/snippet}
</Story>

<style>
  .bc-account-tree-table-story {
    max-width: 64rem;
    padding: var(--ui-beancount-space-5);
  }

  .bc-account-tree-table-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
