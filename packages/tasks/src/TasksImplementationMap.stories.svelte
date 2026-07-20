<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import TasksImplementationMap from "./components/TasksImplementationMap.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Implementation Map",
    component: TasksImplementationMap,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Build-order overview. Each card has a corresponding page or component placeholder story before any final Tasks UI is implemented.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import {
    componentImplementationBriefs,
    pageImplementationBriefs,
  } from "./lib/story-data.js";
</script>

<Story
  name="Component breakdown"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Tasks component breakdown")).toBeVisible();
    await expect(canvas.getByText("Task row")).toBeVisible();
    await expect(canvas.getByText("Tasks shell")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksImplementationMap
      pages={pageImplementationBriefs}
      components={componentImplementationBriefs}
    />
  {/snippet}
</Story>
