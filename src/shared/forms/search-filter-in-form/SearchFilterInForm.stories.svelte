<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import {
    SearchFilterBar,
    createDemoLedgerFilterSyntax,
  } from "@lapismd/design-core/filter";
  import {
    FilterCommandPicker,
    type FilterCommandOption,
  } from "../filter-command-picker";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Search Filter in a Form",
    parameters: {
      docs: {
        description: {
          component:
            "Composition example: `@lapismd/design-core/filter` SearchFilterBar with toolbar FilterCommandPicker pills (no FormField wrapper).",
        },
      },
    },
  });

  const STATUS_OPTIONS: FilterCommandOption[] = [
    { value: "all", label: "All" },
    { value: "open", label: "Open" },
    { value: "done", label: "Done" },
  ];
</script>

<script lang="ts">
  let query = $state("status:open");
  let status = $state("open");
  let filtersExpanded = $state(true);

  const syntax = createDemoLedgerFilterSyntax();
</script>

<Story
  name="Toolbar search"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const search = canvas.getByRole("searchbox", { name: "Filter items" });
    await expect(search).toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent(/status:open/);
    await userEvent.click(search);
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("status")).toHaveTextContent(/status:open/);
  }}
>
  {#snippet template()}
    <div class="mx-auto max-w-3xl p-4">
      <SearchFilterBar
        value={query}
        inputMode="filter-query"
        filterSyntax={{
          ...syntax,
          title: "Item filter syntax",
          fields: [
            {
              name: "status",
              description: "Workflow status.",
              operators: [":", "=", "!="],
              values: ["open", "done"],
            },
            ...syntax.fields.filter((field) => field.name !== "type"),
          ],
        }}
        ariaLabel="Filter items"
        showFilterToggle
        bind:filtersExpanded
        onValueChange={(next) => {
          query = next;
        }}
      >
        {#snippet filters()}
          <FilterCommandPicker
            label="Status"
            ariaLabel="Filter by status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(next) => {
              status = next;
              if (next && next !== "all") query = `status:${next}`;
            }}
          />
        {/snippet}
      </SearchFilterBar>
      <output class="text-muted-foreground mt-3 block text-center text-sm">
        Query: {query || "(empty)"}
      </output>
    </div>
  {/snippet}
</Story>
