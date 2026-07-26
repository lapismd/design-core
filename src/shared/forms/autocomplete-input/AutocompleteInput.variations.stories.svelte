<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AutocompleteInput from "./AutocompleteInput.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Autocomplete Input",
    component: AutocompleteInput,
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
  name="With value"
  exportName="WithValue"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: {
        story: "Focus the field in the canvas to open suggestions.",
      },
    },
  }}
>
  {#snippet template()}
    <AutocompleteInput
      value="t"
      suggestions={["typescript", "testing", "svelte"]}
      placeholder="Search..."
      ariaLabel="Search"
    />
  {/snippet}
</Story>
