<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import MergeEditor from "./MergeEditor.svelte";
  import { Basic } from "./MergeEditor.example-sources.js";
  const { Story } = defineMeta({
    title: "Diff/Merge Editor",
    component: MergeEditor,
    tags: ["!autodocs", "visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Filename icon in merge title"
  play={async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector(
        ".ui-diff-merge-editor__title [data-file-type-icon='markdown']",
      ),
    ).toBeVisible();
  }}
  >{#snippet template()}<div style="height:26rem;padding:1rem">
      <MergeEditor
        path="Notes/plan.md"
        left="Left note"
        base="Original note"
        right="Right note"
      />
    </div>{/snippet}</Story
>
