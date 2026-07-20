<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import TasksImplementationBrief from "./TasksImplementationBrief.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Task Properties",
    component: TasksImplementationBrief,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Property controls expose owner-provided task data without taking persistence responsibility. Its full specification is on this component's Docs page.",
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

  const taskProperties = getComponentImplementationBrief("task-properties");
</script>

<Story
  name="Implementation placeholder"
  exportName="ImplementationPlaceholder"
  parameters={{ visualDelta: referenceVisualDelta("desktop-task-detail") }}
>
  {#snippet template()}<TasksImplementationBrief
      brief={taskProperties}
    />{/snippet}
</Story>

<Story
  name="Change a property (TODO)"
  exportName="ChangePropertyTodo"
  tags={["todo"]}
  parameters={{ visualDelta: referenceVisualDelta("desktop-task-detail") }}
  play={async ({ canvas }) => {
    await userEvent.selectOptions(canvas.getByLabelText("Priority"), "High");
    await expect(canvas.getByText("Priority set to High")).toBeVisible();
  }}
>
  {#snippet template()}<TasksInteractionTodo scenario="properties" />{/snippet}
</Story>
