<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import SearchFilterBar from "./SearchFilterBar.svelte";
  import { createDemoLedgerFilterSyntax } from "../demo-ledger-filter-syntax.js";
  import { parseFilterQuery } from "../filter-query/index.js";
  import {
    FilterCommandPicker,
    type FilterCommandOption,
  } from "@stevejuma/ui/forms";

  const { Story } = defineMeta({
    title: "Filter/Search Filter Bar",
    component: SearchFilterBar,
    parameters: {
      docs: {
        description: {
          component:
            "Search chrome with optional filter-query highlighting and host-supplied autocomplete. Import from `@stevejuma/ui/filter`.",
        },
      },
    },
  });

  const demoSyntax = createDemoLedgerFilterSyntax();

  const TYPE_OPTIONS: FilterCommandOption[] = [
    { value: "all", label: "All types" },
    { value: "transaction", label: "Transaction" },
    { value: "balance", label: "Balance" },
    { value: "note", label: "Note" },
  ];

  const ACCOUNT_OPTIONS: FilterCommandOption[] = [
    { value: "Assets:Cash", label: "Assets:Cash" },
    { value: "Expenses:Food", label: "Expenses:Food" },
    { value: "Income:Salary", label: "Income:Salary" },
  ];
</script>

<script lang="ts">
  let plainValue = $state("");
  let filterValue = $state('payee:"Whole Foods"');
  let ledgerQuery = $state("account:Expenses");
  let filtersExpanded = $state(true);
  let selectedType = $state("all");
  let selectedAccount = $state("");

  const parsePreview = $derived.by(() => {
    const [filter, errors] = parseFilterQuery(ledgerQuery);
    return {
      ok: errors.length === 0,
      type: filter.constructor.name,
      errors,
    };
  });
</script>

<Story
  name="Updates the query"
  play={async ({ canvas }) => {
    const input = canvas.getByRole("searchbox", { name: "Search documents" });
    await userEvent.type(input, "design");
    await expect(canvas.getByRole("status")).toHaveTextContent("design");
  }}
>
  {#snippet template()}
    <div class="max-w-xl">
      <SearchFilterBar
        value={plainValue}
        ariaLabel="Search documents"
        onValueChange={(next) => {
          plainValue = next;
        }}
      />
      <output class="text-muted-foreground mt-2 block text-sm">
        {plainValue || "empty"}
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Shows an error" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="max-w-xl">
      <SearchFilterBar
        value=""
        ariaLabel="Search documents"
        error="This field is required."
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Filter query autocomplete"
  tags={["skip-visual"]}
  play={async ({ canvas, canvasElement }) => {
    const box = canvas.getByRole("searchbox", { name: "Filter ledger" });
    await userEvent.click(box);
    await userEvent.keyboard("{Control>}a{/Control}{Backspace}");
    await userEvent.keyboard("pay");
    const body = canvasElement.ownerDocument.body;
    await waitFor(() => {
      expect(body.querySelector(".cm-tooltip-autocomplete")).toBeTruthy();
    });
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      expect(canvas.getByRole("status")).toHaveTextContent(/payee/i);
    });
    // Dismiss the completion popup so a11y does not flag an unfocusable scroll region.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(body.querySelector(".cm-tooltip-autocomplete")).toBeNull();
    });
  }}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <SearchFilterBar
        value={filterValue}
        inputMode="filter-query"
        filterSyntax={demoSyntax}
        ariaLabel="Filter ledger"
        showFilterToggle
        bind:filtersExpanded
        onValueChange={(next) => {
          filterValue = next;
        }}
      />
      <output class="text-muted-foreground mt-2 block text-sm">
        {filterValue || "empty"}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Ledger search demo"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("searchbox", { name: "Ledger search" }),
    ).toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent(
      /AccountFilter|FieldFilter|ok/i,
    );
  }}
>
  {#snippet template()}
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-3">
      <SearchFilterBar
        value={ledgerQuery}
        inputMode="filter-query"
        filterSyntax={createDemoLedgerFilterSyntax({
          types: TYPE_OPTIONS.filter((o) => o.value !== "all").map(
            (o) => o.value,
          ),
          accounts: ACCOUNT_OPTIONS.map((o) => o.value),
        })}
        ariaLabel="Ledger search"
        placeholder="account:… payee:… #tag"
        showFilterToggle
        bind:filtersExpanded
        showClearAll
        onValueChange={(next) => {
          ledgerQuery = next;
        }}
        onClearSearch={() => {
          ledgerQuery = "";
        }}
        onClearAll={() => {
          ledgerQuery = "";
          selectedType = "all";
          selectedAccount = "";
        }}
      >
        {#snippet filters()}
          <FilterCommandPicker
            label="Type"
            ariaLabel="Filter by type"
            options={TYPE_OPTIONS}
            value={selectedType}
            onChange={(next) => {
              selectedType = next;
              if (next && next !== "all") {
                ledgerQuery = `type:${next}`;
              }
            }}
          />
          <FilterCommandPicker
            label="Account"
            ariaLabel="Filter by account"
            options={ACCOUNT_OPTIONS}
            value={selectedAccount}
            allowCustom
            onChange={(next) => {
              selectedAccount = next;
              if (next) {
                ledgerQuery = `account:${next}`;
              }
            }}
          />
        {/snippet}
      </SearchFilterBar>
      <output
        class="text-muted-foreground rounded-md border px-3 py-2 font-mono text-xs"
      >
        {#if parsePreview.ok}
          ok · {parsePreview.type}
        {:else}
          errors · {parsePreview.errors.join("; ") || "parse failed"}
        {/if}
      </output>
    </div>
  {/snippet}
</Story>
