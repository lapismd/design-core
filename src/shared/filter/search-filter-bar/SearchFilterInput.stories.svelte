<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import SearchFilterInput from "./SearchFilterInput.svelte";
  import { createDemoLedgerFilterSyntax } from "../demo-ledger-filter-syntax.js";

  const { Story } = defineMeta({
    title: "Filter/Search Filter Bar",
    component: SearchFilterInput,
    parameters: {
      docs: {
        description: {
          component:
            "Compact controlled query input shared by SearchFilterBar and dense filter rows.",
        },
        source: {
          language: "tsx",
          type: "code",
          code: `<SearchFilterInput
  value={query}
  inputMode="filter-query"
  density="compact"
  filterSyntax={syntax}
  onValueChange={(next) => (query = next)}
/>`,
        },
      },
    },
  });

  const syntax = createDemoLedgerFilterSyntax();
</script>

<script lang="ts">
  let query = $state("");
</script>

<Story
  name="Compact query autocomplete"
  tags={["visual-pending", "test"]}
  play={async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const searchbox = canvas.getByRole("searchbox", {
      name: "Filter transactions",
    });
    await userEvent.click(searchbox);
    await waitFor(() =>
      expect(page.getByRole("option", { name: /account/i })).toBeVisible(),
    );
    await userEvent.type(searchbox, "payee ");
    await waitFor(() =>
      expect(page.getByRole("option", { name: /matches/i })).toBeVisible(),
    );
    const portal = canvasElement.ownerDocument.querySelector(
      '[data-ui-component="search-filter-bar-tooltip-layer"]',
    );
    await expect(portal?.parentElement).toBe(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole("status")).toHaveTextContent("payee");
    await userEvent.keyboard("{Escape}");
  }}
>
  {#snippet template()}
    <div data-testid="compact-query-story" style="width: 15rem; padding: 1rem;">
      <SearchFilterInput
        value={query}
        inputMode="filter-query"
        density="compact"
        filterSyntax={syntax}
        ariaLabel="Filter transactions"
        error={query === "(" ? "Invalid query" : null}
        onValueChange={(next) => {
          query = next;
        }}
      />
      <output>{query}</output>
    </div>
  {/snippet}
</Story>
