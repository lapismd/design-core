<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import {
    SearchFilterBar,
    createDemoLedgerFilterSyntax,
  } from "@stevejuma/ui/filter";
  import FormField from "../form-field/FormField.svelte";
  import FormSectionHeader from "../form-section-header/FormSectionHeader.svelte";
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
            "Composition example: `@stevejuma/ui/filter` SearchFilterBar inside form chrome. The bar is owned by the filter layer — forms only compose it.",
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
    <div class="cv-structured-form mx-auto max-w-2xl rounded-md border p-4">
      <FormSectionHeader
        title="Inbox"
        index={0}
        total={1}
        editable={false}
        movable={false}
        removable={false}
        titleToggleable
      />
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
          <FormField label="Status" as="div" align="center">
            <FilterCommandPicker
              label="Status"
              ariaLabel="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(next) => {
                status = next;
                if (next && next !== "all") query = `status:${next}`;
              }}
            />
          </FormField>
        {/snippet}
      </SearchFilterBar>
      <output class="text-muted-foreground mt-3 block text-sm">
        Query: {query || "(empty)"}
      </output>
    </div>
  {/snippet}
</Story>
