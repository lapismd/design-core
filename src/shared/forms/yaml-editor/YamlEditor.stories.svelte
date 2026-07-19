<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import YamlEditor from "./YamlEditor.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/YAML Editor",
    component: YamlEditor,
    parameters: {
      docs: {
        description: {
          component: "CodeMirror YAML editor with optional review diffs.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("name: Northstar\nenabled: true\n");
</script>

<Story
  name="Renders YAML source"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "YAML editor" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="max-w-2xl">
      <YamlEditor bind:value ariaLabel="YAML editor" minHeight="10rem" />
    </div>
  {/snippet}
</Story>
