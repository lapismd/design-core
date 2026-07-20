<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fireEvent } from "storybook/test";
  import TasksImplementationBrief from "./TasksImplementationBrief.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Task List",
    component: TasksImplementationBrief,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "The collection contract groups task rows, preserves selection visibility, and accepts reorder state from its owner. Its full specification is on this component's Docs page.",
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

  const taskList = getComponentImplementationBrief("task-list");
</script>

<Story
  name="Implementation placeholder"
  exportName="ImplementationPlaceholder"
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
>
  {#snippet template()}<TasksImplementationBrief brief={taskList} />{/snippet}
</Story>

<Story
  name="Accept reordered rows (TODO)"
  exportName="AcceptReorderTodo"
  tags={["todo"]}
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
  play={async ({ canvas }) => {
    const dragHandle = canvas.getByRole("button", {
      name: "Drag Review the launch brief",
    });
    await fireEvent.pointerDown(dragHandle, { clientY: 0 });
    await fireEvent.pointerUp(dragHandle, { clientY: 48 });
    await expect(canvas.getByText("Task reordered")).toBeVisible();
  }}
>
  {#snippet template()}<TasksInteractionTodo scenario="reorder" />{/snippet}
</Story>
