<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import TasksImplementationBrief from "./components/TasksImplementationBrief.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components",
    component: TasksImplementationBrief,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Task-specific component placeholders. These are deliberate contracts for a later implementation pass, rather than deceptive, partially functional product components.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { componentImplementationBriefs } from "./lib/story-data.js";

  const taskRow = componentImplementationBriefs[0];
  const taskList = componentImplementationBriefs[1];
  const taskComposer = componentImplementationBriefs[2];
  const taskDetail = componentImplementationBriefs[3];
  const taskProperties = componentImplementationBriefs[4];
  const listNavigation = componentImplementationBriefs[5];
  const filtersMenus = componentImplementationBriefs[6];
  const feedback = componentImplementationBriefs[7];
  const motion = componentImplementationBriefs[8];
</script>

<Story
  name="Task row"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Task row")).toBeVisible();
    await expect(
      canvas.getByText("Checkbox before semantic completion control"),
    ).toBeVisible();
  }}
>
  {#snippet template()}<TasksImplementationBrief brief={taskRow} />{/snippet}
</Story>

<Story name="Task list">
  {#snippet template()}<TasksImplementationBrief brief={taskList} />{/snippet}
</Story>

<Story name="Task composer">
  {#snippet template()}<TasksImplementationBrief
      brief={taskComposer}
    />{/snippet}
</Story>

<Story name="Task detail">
  {#snippet template()}<TasksImplementationBrief brief={taskDetail} />{/snippet}
</Story>

<Story name="Task properties">
  {#snippet template()}<TasksImplementationBrief
      brief={taskProperties}
    />{/snippet}
</Story>

<Story name="List navigation and index">
  {#snippet template()}<TasksImplementationBrief
      brief={listNavigation}
    />{/snippet}
</Story>

<Story name="Filters and menus">
  {#snippet template()}<TasksImplementationBrief
      brief={filtersMenus}
    />{/snippet}
</Story>

<Story name="Feedback and empty states">
  {#snippet template()}<TasksImplementationBrief brief={feedback} />{/snippet}
</Story>

<Story name="Motion and gestures">
  {#snippet template()}<TasksImplementationBrief brief={motion} />{/snippet}
</Story>
