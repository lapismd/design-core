<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import { Basic } from "./FileChangeStats.example-sources.js";
  import FileChangeStats from "./FileChangeStats.svelte";

  const { Story } = defineMeta({
    title: "Diff/File Change Stats",
    component: FileChangeStats,
    parameters: {
      docs: {
        description: {
          component:
            "Colored additions and deletions counts for a change-set row or summary.",
        },
        source: { code: Basic, language: "tsx", type: "code" },
      },
    },
  });
</script>

<Story
  name="Shows added and removed counts"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("+12")).toBeVisible();
    await expect(canvas.getByText("-3")).toBeVisible();
    await expect(canvas.getByText("+12")).toHaveAttribute("data-tone", "added");
    await expect(canvas.getByText("-3")).toHaveAttribute(
      "data-tone",
      "removed",
    );
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="p-4">
      <FileChangeStats additions={12} deletions={3} />
    </div>
  {/snippet}
</Story>

<Story
  name="Hides a zero side"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("+8")).toBeVisible();
    await expect(canvas.queryByText("-0")).toBeNull();
  }}
  tags={["visual-pending"]}
>
  {#snippet template()}
    <div class="p-4">
      <FileChangeStats additions={8} deletions={0} />
    </div>
  {/snippet}
</Story>
