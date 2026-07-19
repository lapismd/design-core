<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ReadOnlyFormGroup from "./ReadOnlyFormGroup.svelte";
  import ReadOnlyFormList from "./ReadOnlyFormList.svelte";
  import ReadOnlyFormRow from "./ReadOnlyFormRow.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Read Only Form",
    component: ReadOnlyFormGroup,
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
  name="Group"
  exportName="Group"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Group with row + list." },
    },
  }}
>
  {#snippet template()}
    <ReadOnlyFormGroup title="Profile" meta="Preview">
      <ReadOnlyFormRow label="Title" value="Northstar" />
      <ReadOnlyFormList label="Skills" items={["TypeScript", "Svelte"]} />
    </ReadOnlyFormGroup>
  {/snippet}
</Story>

<Story
  name="Row only"
  exportName="RowOnly"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Single read-only row." },
    },
  }}
>
  {#snippet template()}
    <ReadOnlyFormRow label="Title" value="Northstar" />
  {/snippet}
</Story>
