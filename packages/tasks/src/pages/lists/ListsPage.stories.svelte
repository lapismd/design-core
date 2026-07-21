<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Page from "./ListsPage.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Pages/Lists",
    component: Page,
    // Out of scope while Tasks Shell is driven by Superlist reference baselines.
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component: "Fixture-driven Lists page composition.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { visualDeltaForStory } from "../../lib/visual-delta.js";
</script>

<Story
  name="Default"
  exportName="Default"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-pages-lists--default"),
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Detail closed")).toBeVisible();
  }}
>
  {#snippet template()}
    <Page />
  {/snippet}
</Story>
