<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Page from "./UpdatesPage.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Pages/Updates",
    component: Page,
    // Out of scope while Tasks Shell is driven by Superlist reference baselines.
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component: "Fixture-driven Updates page composition.",
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
    visualDelta: visualDeltaForStory("tasks-pages-updates--default"),
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
  name="Loading"
  exportName="Loading"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-pages-updates--loading"),
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Loading updates")).toBeVisible();
  }}
>
  {#snippet template()}
    <Page feedbackMode="loading" />
  {/snippet}
</Story>

<Story
  name="Error with retry"
  exportName="ErrorRetry"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-pages-updates--error-retry"),
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByText("Retry"));
    await expect(canvas.getByText("Retry requested")).toBeVisible();
  }}
>
  {#snippet template()}
    <Page feedbackMode="error" />
  {/snippet}
</Story>
