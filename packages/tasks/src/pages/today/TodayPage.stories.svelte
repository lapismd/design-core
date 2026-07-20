<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Page from "./TodayPage.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Pages/Today",
    component: Page,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component: "Fixture-driven Today page composition.",
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
  parameters={{ visualDelta: referenceVisualDelta("desktop-today") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Today")).toBeVisible();
  }}
>
  {#snippet template()}
    <Page />
  {/snippet}
</Story>

<Story
  name="Open detail"
  exportName="OpenDetail"
  parameters={{ visualDelta: referenceVisualDelta("desktop-task-detail") }}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Review the launch brief" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Details" }));
    await expect(canvas.getByText("Detail open task-brief")).toBeVisible();
  }}
>
  {#snippet template()}
    <Page />
  {/snippet}
</Story>
