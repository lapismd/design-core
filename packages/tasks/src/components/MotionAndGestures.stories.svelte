<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fireEvent } from "storybook/test";
  import TasksImplementationBrief from "./TasksImplementationBrief.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Motion and Gestures",
    component: TasksImplementationBrief,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Motion contracts set observed timing bands and make touch gesture thresholds explicit. Its full specification is on this component's Docs page.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import TasksInteractionTodo from "./TasksInteractionTodo.svelte";
  import {
    getComponentImplementationBrief,
    referenceVisualDelta,
  } from "../lib/story-data.js";

  const motion = getComponentImplementationBrief("tasks-motion");
</script>

<Story
  name="Implementation placeholder"
  exportName="ImplementationPlaceholder"
  parameters={{ visualDelta: referenceVisualDelta("task-open-motion") }}
>
  {#snippet template()}<TasksImplementationBrief brief={motion} />{/snippet}
</Story>

<Story
  name="Reveal a row action after the swipe threshold (TODO)"
  exportName="SwipeThresholdTodo"
  tags={["todo"]}
  parameters={{ visualDelta: referenceVisualDelta("mobile-swipe-motion") }}
  play={async ({ canvas }) => {
    const row = canvas.getByRole("button", {
      name: "Swipe Review the launch brief left to reveal actions",
    });
    await fireEvent.pointerDown(row, { clientX: 160 });
    await fireEvent.pointerUp(row, { clientX: 96 });
    await expect(canvas.getByText("Trailing action revealed")).toBeVisible();
  }}
>
  {#snippet template()}<TasksInteractionTodo scenario="swipe-row" />{/snippet}
</Story>
