<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FormPlaceholder from "../form-placeholder/FormPlaceholder.svelte";
  import EntryActions from "./EntryActions.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Entry Actions",
    component: EntryActions,
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
  name="Single entry"
  exportName="SingleEntry"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "First and only entry (move disabled)." },
    },
  }}
>
  {#snippet template()}
    <EntryActions index={0} total={1}>
      <FormPlaceholder>Only entry</FormPlaceholder>
    </EntryActions>
  {/snippet}
</Story>

<Story
  name="Middle entry"
  exportName="MiddleEntry"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Reorderable middle item." },
    },
  }}
>
  {#snippet template()}
    <EntryActions index={1} total={3}>
      <FormPlaceholder>Middle entry</FormPlaceholder>
    </EntryActions>
  {/snippet}
</Story>
