<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import IngestionReviewTable from "./IngestionReviewTable.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Tables/Ingestion Review Table",
    component: IngestionReviewTable,
    parameters: {
      docs: {
        description: {
          component:
            "A model-driven queue for grouped import proposals. It owns queue controls, selection, date disclosure, and row presentation. The application supplies preformatted proposal data and owns search, pagination, routing, review sheets, and all mutations.",
        },
      },
    },
  });

  const reviewGroups = [
    {
      id: "2026-07-18",
      label: "July 18, 2026",
      rows: [
        {
          id: "northstar-cafe",
          title: "Northstar Cafe",
          detail: "Lunch near the office",
          status: "needs-review" as const,
          statusLabel: "Needs review",
          postings: [
            { account: "Liabilities:Northstar:Card", amount: "−£15.50" },
            { account: "Expenses:Dining", amount: "+£15.50" },
          ],
        },
        {
          id: "cash-withdrawal",
          title: "Cash withdrawal",
          detail: "Choose an account before approving this proposal",
          status: "held" as const,
          amount: "−£40.00",
          selectable: false,
        },
      ],
    },
  ];
  const readyGroups = [
    {
      id: "2026-07-18-ready",
      label: "July 18, 2026",
      rows: [
        {
          id: "grocerly",
          title: "Grocerly",
          detail: "Food and household shopping",
          status: "ready" as const,
          postings: [
            { account: "Liabilities:Northstar:Card", amount: "−£42.17" },
            { account: "Expenses:Groceries", amount: "+£42.17" },
          ],
        },
        {
          id: "duplicate-coffee",
          title: "Duplicate coffee transaction",
          detail: "Matches a previously imported transaction",
          status: "duplicate" as const,
          amount: "−£3.20",
        },
      ],
    },
  ];
</script>

<script lang="ts">
  let filter = $state<"review" | "ready">("review");
  let selectedIds = $state<string[]>([]);
  let openedTitle = $state("");
  const groups = $derived(filter === "review" ? reviewGroups : readyGroups);
</script>

<Story
  name="Selects grouped proposals and changes queues"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select Northstar Cafe" }),
    );
    await expect(
      canvas.getByRole("status", { name: "Selection status" }),
    ).toHaveTextContent("1 proposal selected");

    await userEvent.click(canvas.getByRole("button", { name: "Ready (1)" }));
    await expect(canvas.getByText("Grocerly")).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse July 18, 2026" }),
    );
    await expect(canvas.queryByText("Grocerly")).not.toBeInTheDocument();
  }}
>
  {#snippet template()}
    <div class="bc-ingestion-review-story">
      <IngestionReviewTable
        {groups}
        counts={{ review: 2, ready: 1, duplicates: 1 }}
        {filter}
        {selectedIds}
        onFilterChange={(value) => {
          filter = value;
          selectedIds = [];
        }}
        onSelectedIdsChange={(ids) => {
          selectedIds = ids;
        }}
        onOpenRow={(row) => {
          openedTitle = row.title;
        }}
      />
      <output
        class="bc-ingestion-review-story__status"
        aria-label="Selection status"
      >
        {openedTitle
          ? `Opened ${openedTitle}`
          : `${selectedIds.length} proposal${selectedIds.length === 1 ? "" : "s"} selected`}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Explains an empty queue"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText("No proposals match the current review filters."),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-ingestion-review-story">
      <IngestionReviewTable
        groups={[]}
        counts={{ review: 0, ready: 0, duplicates: 0 }}
        emptyLabel="No proposals match the current review filters."
      />
    </div>
  {/snippet}
</Story>

<style>
  .bc-ingestion-review-story {
    max-width: 72rem;
    padding: var(--ui-beancount-space-5);
  }

  .bc-ingestion-review-story__status {
    display: block;
    margin-block-start: var(--ui-beancount-space-3);
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.875rem;
  }
</style>
