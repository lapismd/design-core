<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import YamlEditor from "./YamlEditor.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/YAML Editor",
    component: YamlEditor,
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
  name="Valid document"
  exportName="ValidDocument"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Simple YAML document." },
    },
  }}
>
  {#snippet template()}
    <YamlEditor value={"name: Jane\nrole: Designer\n"} minHeight="10rem" />
  {/snippet}
</Story>
