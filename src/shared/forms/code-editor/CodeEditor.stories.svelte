<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import CodeEditor from "./CodeEditor.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Editors/Code Editor",
    component: CodeEditor,
    parameters: {
      docs: {
        description: {
          component:
            "CodeMirror multi-language editor used by form source modes.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("# example\nx = 1\n");
</script>

<Story
  name="Renders a language editor"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "Source editor" }),
    ).toBeVisible();
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <CodeEditor
        bind:value
        language="text"
        ariaLabel="Source editor"
        minHeight="10rem"
      />
    </div>
  {/snippet}
</Story>
