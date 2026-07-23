<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, screen, userEvent } from "storybook/test";
  import LedgerActivityTable from "./LedgerActivityTable.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Tables/Ledger Activity Table",
    component: LedgerActivityTable,
    parameters: {
      docs: {
        description: {
          component:
            "A model-driven ledger activity surface. It owns visual grouping, disclosure, selection, compact two-or-three-option timeframe controls, record identity, multi-posting breakdowns, balance summaries, and record actions while the application supplies ledger-derived data and routing callbacks. Use this instead of rebuilding a journal-like list in a route.",
        },
      },
    },
  });

  const groups = [
    {
      id: "2026-07-18",
      date: "18 July 2026",
      balance: "£1,510.00",
      summary: {
        start: "£1,552.17",
        change: "−£42.17",
        final: "£1,510.00",
      },
      records: [
        {
          id: "groceries",
          description: "Groceries",
          account: "Expenses:Groceries",
          detail: "Weekly household shopping",
          amount: "−£42.17",
          merchant: {
            imageUrl:
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' rx='8' fill='%234f46e5'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-family='sans-serif' font-size='20'%3EG%3C/text%3E%3C/svg%3E",
            alt: "Groceries merchant mark",
          },
          postings: [
            {
              account: "Expenses:Groceries",
              amount: "£42.17",
              href: "/account/Expenses:Groceries",
            },
            { account: "Assets:Cash", amount: "−£42.17" },
          ],
        },
        {
          id: "salary",
          description: "Salary",
          account: "Income:Salary",
          amount: "+£3,200.00",
          avatar: { fallback: "S" },
          postings: [
            { account: "Assets:Cash", amount: "+£3,200.00" },
            { account: "Income:Salary", amount: "−£3,200.00" },
          ],
        },
      ],
    },
    {
      id: "2026-07-17",
      date: "17 July 2026",
      balance: "£1,087.83",
      records: [
        {
          id: "utilities",
          description: "Electricity bill",
          account: "Expenses:Utilities",
          amount: "−£86.55",
        },
      ],
    },
  ];

  const upcomingGroups = [
    {
      id: "2026-07-25",
      date: "25 July 2026",
      balance: "£1,510.00",
      records: [
        {
          id: "scheduled-rent",
          description: "Scheduled rent",
          account: "Expenses:Rent",
          detail: "Monthly rent due",
          amount: "−£1,300.00",
          avatar: { fallback: "R" },
          postings: [
            { account: "Assets:Cash", amount: "−£1,300.00" },
            { account: "Expenses:Rent", amount: "£1,300.00" },
          ],
        },
      ],
    },
  ];
</script>

<script lang="ts">
  import AccountBulkActionSheet from "./AccountBulkActionSheet.svelte";
  import { Button } from "@stevejuma/ui/shadcn/button";

  let selectedIds = $state<string[]>([]);
  let openedRecord = $state("");
  let activityTimeframe = $state("posted");
  const activityGroups = $derived(
    activityTimeframe === "upcoming" ? upcomingGroups : groups,
  );
  let bulkSelectedIds = $state<string[]>([]);
  let bulkSheetOpen = $state(false);
  let bulkStatus = $state("");
</script>

<Story
  name="Selects records and opens their details"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select Groceries" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "1 record selected",
    );

    await userEvent.click(canvas.getByRole("button", { name: /Groceries/ }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Opened Groceries",
    );
  }}
>
  {#snippet template()}
    <div class="bc-ledger-activity-story">
      <LedgerActivityTable
        {groups}
        {selectedIds}
        onSelectedIdsChange={(ids) => {
          selectedIds = ids;
        }}
        onOpenRecord={(record) => {
          openedRecord = record.description;
        }}
      />
      <output class="bc-ledger-activity-story__status" aria-live="polite">
        {openedRecord
          ? `Opened ${openedRecord}`
          : `${selectedIds.length} record${selectedIds.length === 1 ? "" : "s"} selected`}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Collapses a date group"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /18 July 2026/ }));
    await expect(
      canvas.queryByText("Weekly household shopping"),
    ).not.toBeInTheDocument();
    await expect(canvas.queryByText("Start balance")).not.toBeInTheDocument();
  }}
>
  {#snippet template()}
    <div class="bc-ledger-activity-story">
      <LedgerActivityTable {groups} selectable={false} />
    </div>
  {/snippet}
</Story>

<Story
  name="Changes between posted and upcoming activity"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Upcoming" }));
    await expect(canvas.getByText("Scheduled rent")).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Showing upcoming activity",
    );
  }}
>
  {#snippet template()}
    <div class="bc-ledger-activity-story">
      <LedgerActivityTable
        groups={activityGroups}
        selectable={false}
        timeframes={[
          { id: "posted", label: "Posted" },
          { id: "upcoming", label: "Upcoming" },
        ]}
        timeframe={activityTimeframe}
        onTimeframeChange={(value) => {
          activityTimeframe = value;
        }}
      />
      <output class="bc-ledger-activity-story__status" aria-live="polite">
        Showing {activityTimeframe} activity
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Explains an empty filtered result"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText("No dated records match the current filter."),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-ledger-activity-story">
      <LedgerActivityTable groups={[]} />
    </div>
  {/snippet}
</Story>

<Story
  name="Selects activity and applies bulk account actions"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select Groceries" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "1 record selected",
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Replace accounts (1)" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Bulk actions" });
    await expect(dialog).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    await expect(
      screen.getByText("Updated 1 record from Expenses:Groceries."),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-ledger-activity-workflow">
      <div
        class="bc-ledger-activity-workflow__header"
      >
        <span class="bc-ledger-activity-workflow__title">Journal actions</span>
        <Button
          type="button"
          size="sm"
          disabled={bulkSelectedIds.length === 0}
          onclick={() => {
            bulkSheetOpen = true;
          }}
        >
          Replace accounts ({bulkSelectedIds.length})
        </Button>
      </div>
      <div class="bc-ledger-activity-workflow__body">
        <LedgerActivityTable
          {groups}
          selectedIds={bulkSelectedIds}
          onSelectedIdsChange={(ids) => {
            bulkSelectedIds = ids;
          }}
        />
      </div>
      <AccountBulkActionSheet
        bind:open={bulkSheetOpen}
        recordCount={bulkSelectedIds.length}
        fromAccount="Expenses:Groceries"
        toAccount="Expenses:Food"
        fromOptions={[
          { value: "Expenses:Groceries", label: "Expenses:Groceries" },
        ]}
        toOptions={[
          { value: "Expenses:Food", label: "Expenses:Food" },
          { value: "Expenses:Groceries", label: "Expenses:Groceries" },
        ]}
        replacement={{ changedCount: bulkSelectedIds.length }}
        duplicates={{ groupCount: 0, deleteCount: 0, keepCount: 0 }}
        status={bulkStatus}
        onApplyReplacement={({ fromAccount }) => {
          bulkStatus = `Updated ${bulkSelectedIds.length} record${bulkSelectedIds.length === 1 ? "" : "s"} from ${fromAccount}.`;
        }}
      />
      <output class="bc-ledger-activity-story__status" aria-live="polite">
        {bulkSelectedIds.length} record{bulkSelectedIds.length === 1 ? "" : "s"}
        selected
      </output>
    </div>
  {/snippet}
</Story>

<style>
  .bc-ledger-activity-story { max-width: 64rem; padding: var(--ui-beancount-space-5); }
  .bc-ledger-activity-story__status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .bc-ledger-activity-workflow { max-width: 64rem; overflow: hidden; border: 1px solid var(--ui-beancount-border); border-radius: var(--ui-beancount-radius-panel); background: var(--ui-beancount-surface); box-shadow: var(--ui-beancount-shadow-panel); }
  .bc-ledger-activity-workflow__header { display: flex; align-items: center; justify-content: space-between; border-block-end: 1px solid var(--ui-beancount-border); background: color-mix(in srgb, var(--ui-beancount-surface-muted) 30%, transparent); padding: var(--ui-beancount-space-2) var(--ui-beancount-space-4); }
  .bc-ledger-activity-workflow__title { font-size: .875rem; font-weight: 500; }
  .bc-ledger-activity-workflow__body { padding: var(--ui-beancount-space-5); }
</style>
