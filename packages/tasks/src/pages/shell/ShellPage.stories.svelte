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
  import { referenceVisualDelta } from "../../lib/story-data.js";
</script>

<Story
  name="Default"
  exportName="Default"
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
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
  parameters={{ visualDelta: referenceVisualDelta("desktop-task-detail") }}
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
  parameters={{ visualDelta: referenceVisualDelta("mobile-inbox") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Detail closed")).toBeVisible();
  }}
>
  {#snippet template()}
    <Page viewport="mobile" />
  {/snippet}
</Story>
