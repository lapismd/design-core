<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CodeEditor from "./CodeEditor.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Code Editor",
    component: CodeEditor,
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
  name="TypeScript"
  exportName="TypeScript"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Default language sample." },
    },
  }}
>
  {#snippet template()}
    <CodeEditor
      value={"const answer = 42;\n"}
      language="ts"
      minHeight="8rem"
    />
  {/snippet}
</Story>
