<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Page from "./TasksPage.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Pages/Tasks",
    component: Page,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component: "Fixture-driven Tasks page composition.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { referenceVisualDelta } from "../../lib/story-data.js";
</script>

<Story
  name="Default"
  exportName="Default"
  parameters={{ visualDelta: referenceVisualDelta("desktop-tasks") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Detail closed")).toBeVisible();
  }}
>
  {#snippet template()}
    <Page />
  {/snippet}
</Story>
