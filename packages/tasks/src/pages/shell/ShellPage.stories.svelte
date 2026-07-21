<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Page from "./ShellPage.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Pages/Tasks shell",
    component: Page,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component: "Fixture-driven Tasks shell page composition.",
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
    visualDelta: visualDeltaForStory("tasks-pages-tasks-shell--default"),
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Detail closed")).toBeVisible();
  }}
>
  {#snippet template()}
    <Page />
  {/snippet}
</Story>

<Story
  name="Wide with detail"
  exportName="WideWithDetail"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-pages-tasks-shell--wide-with-detail",
    ),
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Detail open task-brief")).toBeVisible();
  }}
>
  {#snippet template()}
    <Page startWithDetail />
  {/snippet}
</Story>

<Story
  name="Mobile list"
  exportName="MobileList"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-pages-tasks-shell--mobile-list"),
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Detail closed")).toBeVisible();
  }}
>
  {#snippet template()}
    <Page viewport="mobile" />
  {/snippet}
</Story>
