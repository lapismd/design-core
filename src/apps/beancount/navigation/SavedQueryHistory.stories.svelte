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
    <div class="max-w-3xl p-5">
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
          <div class="bg-background rounded-lg border p-3 text-sm">
            {query.id === "recent-expenses"
              ? "42 matching postings"
              : "6 matching transactions"}
          </div>
        {/snippet}
      </SavedQueryHistory>
      <output class="sr-only" aria-live="polite">{status}</output>
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
    <div class="max-w-3xl p-5">
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
      <output class="sr-only" aria-live="polite">{status}</output>
    </div>
  {/snippet}
</Story>
