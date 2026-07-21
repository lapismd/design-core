<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Page from "./TaskDetailPage.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Pages/Task detail",
    component: Page,
    // Out of scope while Tasks Shell is driven by Superlist reference baselines.
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component: "Fixture-driven Task detail page composition.",
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
    visualDelta: visualDeltaForStory("tasks-pages-task-detail--default"),
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Detail open task-brief")).toBeVisible();
  }}
>
  {#snippet template()}
    <Page />
  {/snippet}
</Story>

<Story
  name="Open detail"
  exportName="OpenDetail"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-pages-task-detail--open-detail"),
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getAllByLabelText("Details")[0]);
    await expect(canvas.getByText("Detail open task-brief")).toBeVisible();
  }}
>
  {#snippet template()}
    <Page />
  {/snippet}
</Story>
