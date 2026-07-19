<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SearchFilterBar from "./SearchFilterBar.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Search Filter Bar",
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
      description: { story: "Idle search pill." },
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
      description: { story: "Populated search value." },
    },
  }}
>
  {#snippet template()}
    <SearchFilterBar value="design system" placeholder="Search..." />
  {/snippet}
</Story>
