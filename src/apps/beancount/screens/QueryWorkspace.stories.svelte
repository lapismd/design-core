<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import QueryWorkspace from "./QueryWorkspace.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Screens/Query Workspace",
    component: QueryWorkspace,
    parameters: {
      docs: {
        description: {
          component:
            "A controlled Fava Query composition. The application supplies BQL execution, persistence, route selection, result details, and error messages; this component only arranges the command and saved-query history.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let query = $state("SELECT account FROM open");
  let selectedHistoryId = $state("open-accounts");
  let expandedHistoryIds = $state<string[]>([]);
  let status = $state("");

  const history = [
    {
      id: "open-accounts",
      query: "SELECT account FROM open",
      label: "Open accounts",
    },
    {
      id: "expense-postings",
      query: "SELECT date, narration WHERE account ~ 'Expenses'",
      label: "Expense postings",
    },
  ];
</script>

<Story
  name="Executes a command and controls saved query disclosure"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Execute" }));
    await expect(
      canvas.getByRole("textbox", { name: "BQL query" }),
    ).toHaveValue("");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Executed SELECT account FROM open",
    );

    const expenses = canvas.getByRole("button", { name: /^Expense postings/ });
    await expect(expenses).toHaveAttribute("data-state", "closed");
    await userEvent.click(expenses);
    await expect(expenses).toHaveAttribute("data-state", "open");
    await expect(
      canvas.getByText("18 matching expense postings"),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-query-workspace-story">
      <QueryWorkspace
        bind:value={query}
        {history}
        {selectedHistoryId}
        {expandedHistoryIds}
        onExecute={(value) => {
          status = `Executed ${value}`;
        }}
        onHistorySelect={(item) => {
          selectedHistoryId = item.id;
        }}
        onHistoryExpandedIdsChange={(ids) => {
          expandedHistoryIds = ids;
        }}
      >
        {#snippet historyDetails(item)}
          <p class="bc-query-workspace-story__result">
            {item.id === "open-accounts"
              ? "8 open accounts"
              : "18 matching expense postings"}
          </p>
        {/snippet}
      </QueryWorkspace>
      <output class="bc-query-workspace-story__status" aria-live="polite"
        >{status}</output
      >
    </div>
  {/snippet}
</Story>

<Story name="Shows a host-provided query failure">
  {#snippet template()}
    <div class="bc-query-workspace-story">
      <QueryWorkspace
        value="SELECT unknown"
        error="Unknown BQL field: unknown"
      />
    </div>
  {/snippet}
</Story>

<style>
  .bc-query-workspace-story {
    height: 42rem;
    max-width: 72rem;
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
  }

  .bc-query-workspace-story__result {
    margin: 0;
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }

  .bc-query-workspace-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
