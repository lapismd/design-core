<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ReadOnlyFormRow from "./ReadOnlyFormRow.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Read Only Form Row",
    component: ReadOnlyFormRow,
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
  name="Default"
  exportName="Default"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Label and value." },
    },
  }}
>
  {#snippet template()}
    <ReadOnlyFormRow label="Title" value="Northstar" />
  {/snippet}
</Story>

<Story
  name="Empty value"
  exportName="EmptyValue"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Missing value still keeps the row." },
    },
  }}
>
  {#snippet template()}
    <ReadOnlyFormRow label="Title" value="" />
  {/snippet}
</Story>
