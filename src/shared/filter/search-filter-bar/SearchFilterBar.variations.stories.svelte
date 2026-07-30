<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import SearchFilterBar from "./SearchFilterBar.svelte";
  import { createDemoLedgerFilterSyntax } from "../demo-ledger-filter-syntax.js";

  const { Story } = defineMeta({
    title: "Filter/Search Filter Bar",
    component: SearchFilterBar,
    parameters: {
      docs: {
        description: {
          component: "Visual variations for Docs.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let chipQuery = $state('payee:"Whole Foods" amount > 20');
</script>

<Story
  name="Empty"
  exportName="Empty"
  parameters={{
    visualDelta: {"images":["/visual-baselines/filter/search-filter-bar/empty-chromium-darwin.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right","passThresholdPercent":0.1},
    docs: {
      description: { story: "Idle plain search pill." },
    },
  }}

  tags={["visual-approved"]}
>
  {#snippet template()}
    <SearchFilterBar value="" placeholder="Search..." />
  {/snippet}
</Story>

<Story
  name="With query"
  exportName="WithQuery"
  parameters={{
    docs: {
      description: { story: "Populated plain search value." },
    },
  }}
>
  {#snippet template()}
    <SearchFilterBar value="design system" placeholder="Search..." />
  {/snippet}
</Story>

<Story
  name="Filter query highlighted"
  exportName="FilterQueryHighlighted"
  parameters={{
    docs: {
      description: {
        story: "Filter-query mode with syntax highlighting and help.",
      },
    },
  }}
>
  {#snippet template()}
    <SearchFilterBar
      value={'payee:"Whole Foods" amount > 20'}
      inputMode="filter-query"
      filterSyntax={createDemoLedgerFilterSyntax()}
      showFilterToggle
      filtersExpanded
      placeholder="Filter…"
    />
  {/snippet}
</Story>

<Story
  name="Filter query predicate chips"
  exportName="FilterQueryPredicateChips"
  parameters={{
    docs: {
      description: {
        story:
          "Completed field-op-value terms render as removable inline chips.",
      },
    },
  }}
  play={async ({ canvas, canvasElement }) => {
    const box = canvas.getByRole("searchbox", {
      name: "Filter with predicate chips",
    });
    await expect(box).toBeInTheDocument();

    await waitFor(() => {
      const chips = canvasElement.querySelectorAll(
        ".cv-search-filter-bar__predicate-chip",
      );
      expect(chips.length).toBeGreaterThanOrEqual(2);
    });

    const chips = canvasElement.querySelectorAll(
      ".cv-search-filter-bar__predicate-chip",
    );
    await userEvent.click(chips[0] as Element);
    const body = canvasElement.ownerDocument.body;
    await waitFor(() => {
      expect(
        body.querySelector('[role="dialog"][aria-label="Edit filter"]'),
      ).toBeTruthy();
    });
    await waitFor(() => {
      expect(
        within(body).getByRole("combobox", { name: "Value" }),
      ).toBeInTheDocument();
    });
    await userEvent.clear(
      within(body).getByRole("combobox", { name: "Value" }),
    );
    await waitFor(() => {
      expect(
        within(body).getByRole("button", { name: "Apply" }),
      ).toBeDisabled();
    });
    await userEvent.click(within(body).getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(
        body.querySelector('[role="dialog"][aria-label="Edit filter"]'),
      ).toBeNull();
    });

    const deletes = canvasElement.querySelectorAll(
      ".cv-search-filter-bar__predicate-chip-delete",
    );
    expect(deletes.length).toBeGreaterThanOrEqual(2);

    await userEvent.click(deletes[1] as Element);

    await waitFor(() => {
      expect(canvas.getByRole("status")).toHaveTextContent(
        'payee:"Whole Foods"',
      );
    });
    await waitFor(() => {
      const remaining = canvasElement.querySelectorAll(
        ".cv-search-filter-bar__predicate-chip",
      );
      expect(remaining).toHaveLength(1);
    });
  }}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <SearchFilterBar
        value={chipQuery}
        inputMode="filter-query"
        filterSyntax={createDemoLedgerFilterSyntax()}
        ariaLabel="Filter with predicate chips"
        placeholder="Filter…"
        onValueChange={(next) => {
          chipQuery = next;
        }}
      />
      <output class="text-muted-foreground mt-2 block text-sm">
        {chipQuery || "empty"}
      </output>
    </div>
  {/snippet}
</Story>
