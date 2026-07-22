<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
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

<Story
  name="Empty"
  exportName="Empty"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Idle plain search pill." },
    },
  }}
>
  {#snippet template()}
    <SearchFilterBar value="" placeholder="Search..." />
  {/snippet}
</Story>

<Story
  name="With query"
  exportName="WithQuery"
  tags={["skip-visual"]}
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
  tags={["skip-visual"]}
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
