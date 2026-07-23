<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import SavedQueryHistory from "./SavedQueryHistory.svelte";
  import type { SavedQueryHistoryItem } from "./SavedQueryHistory.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Navigation/Saved Query History",
    component: SavedQueryHistory,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled saved-query disclosure with copy and delete affordances. Keep query execution, persistence, result models, and real clipboard work in the application; render query-specific results through the `details` snippet.",
        },
      },
    },
  });

  const initialQueries = [
    {
      id: "recent-expenses",
      query: "SELECT date, narration, account WHERE account ~ 'Expenses'",
      label: "Recent expenses",
    },
    {
      id: "uncleared",
      query: "SELECT date, payee WHERE flag = '*'",
      label: "Uncleared transactions",
    },
  ] satisfies SavedQueryHistoryItem[];
</script>

<script lang="ts">
  let queries = $state([...initialQueries]);
  let selectedId = $state("recent-expenses");
  let expandedIds = $state(["recent-expenses"]);
  let status = $state("");
</script>

<Story
  name="Selects, copies, and expands query results"
  play={async ({ canvas }) => {
    const recent = canvas.getByRole("button", { name: /^Recent expenses/ });
    await expect(recent).toHaveAttribute("data-state", "open");
    await expect(canvas.getByText("42 matching postings")).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "Copy query: Recent expenses" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Copied Recent expenses",
    );

    const uncleared = canvas.getByRole("button", {
      name: /^Uncleared transactions/,
    });
    await userEvent.click(uncleared);
    await expect(uncleared).toHaveAttribute("data-state", "open");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Selected Uncleared transactions",
    );
  }}
>
  {#snippet template()}
    <div class="bc-saved-query-history-story">
      <SavedQueryHistory
        {queries}
        {selectedId}
        {expandedIds}
        onSelect={(query) => {
          selectedId = query.id;
          status = `Selected ${query.label}`;
        }}
        onExpandedIdsChange={(ids) => {
          expandedIds = ids;
        }}
        onCopy={(query) => {
          status = `Copied ${query.label}`;
        }}
        onDelete={(query) => {
          queries = queries.filter((item) => item.id !== query.id);
          status = `Deleted ${query.label}`;
        }}
      >
        {#snippet details(query)}
          <div class="bc-saved-query-history-story__details">
            {query.id === "recent-expenses"
              ? "42 matching postings"
              : "6 matching transactions"}
          </div>
        {/snippet}
      </SavedQueryHistory>
      <output class="bc-saved-query-history-story__status" aria-live="polite"
        >{status}</output
      >
    </div>
  {/snippet}
</Story>

<Story
  name="Removes a saved query and explains an empty history"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Delete query: Uncleared transactions",
      }),
    );
    await expect(
      canvas.queryByRole("button", { name: /^Uncleared transactions/ }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Deleted Uncleared transactions",
    );
    await expect(canvas.getByText("No saved queries yet.")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-saved-query-history-story">
      <SavedQueryHistory
        queries={queries.slice(-1)}
        {selectedId}
        {expandedIds}
        onExpandedIdsChange={(ids) => {
          expandedIds = ids;
        }}
        onDelete={(query) => {
          queries = [];
          status = `Deleted ${query.label}`;
        }}
      />
      <output class="bc-saved-query-history-story__status" aria-live="polite"
        >{status}</output
      >
    </div>
  {/snippet}
</Story>

<style>
  .bc-saved-query-history-story {
    max-width: 48rem;
    padding: var(--ui-beancount-space-5);
  }

  .bc-saved-query-history-story__details {
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--radius-lg);
    background: var(--ui-beancount-surface);
    padding: var(--ui-beancount-space-3);
    font-size: var(--text-sm);
  }

  .bc-saved-query-history-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
