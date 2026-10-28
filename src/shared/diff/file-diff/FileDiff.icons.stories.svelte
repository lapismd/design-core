<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import FileDiffComposer from "./FileDiffComposer.svelte";
  import { Composer } from "./FileDiff.example-sources.js";
  const { Story } = defineMeta({
    title: "Diff/File Diff",
    component: FileDiffComposer,
    tags: ["!autodocs", "visual-pending"],
    parameters: {
      docs: { source: { code: Composer, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Filename icons in composed headers"
  play={async ({ canvasElement }) => {
    const headers = canvasElement.querySelectorAll(
      ".ui-diff-file-diff-composer__header",
    );
    await expect(headers).toHaveLength(2);
    await expect(
      headers[0].querySelector("[data-file-type-icon='typescript']"),
    ).toBeVisible();
    await expect(
      headers[1].querySelector("[data-file-type-icon='markdown']"),
    ).toBeVisible();
  }}
  >{#snippet template()}<div style="padding:1rem">
      <FileDiffComposer
        files={[
          {
            path: "src/main.ts",
            oldText: "const value = 1;",
            newText: "const value = 2;",
          },
          { path: "Notes/plan.md", oldText: "Old note", newText: "New note" },
        ]}
      />
    </div>{/snippet}</Story
>
