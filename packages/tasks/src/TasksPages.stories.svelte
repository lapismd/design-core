<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import TasksImplementationBrief from "./components/TasksImplementationBrief.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Pages",
    component: TasksImplementationBrief,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Non-product page placeholders. They name the synthetic fixture, existing primitive reuse, planned additions, and required behaviour for a future implementation slice.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { pageImplementationBriefs } from "./lib/story-data.js";

  const shell = pageImplementationBriefs[0];
  const inbox = pageImplementationBriefs[1];
  const today = pageImplementationBriefs[2];
  const tasks = pageImplementationBriefs[3];
  const updates = pageImplementationBriefs[4];
  const lists = pageImplementationBriefs[5];
  const taskDetail = pageImplementationBriefs[6];
</script>

<Story
  name="Tasks shell"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Tasks shell")).toBeVisible();
    await expect(canvas.getByText("Sidebar")).toBeVisible();
  }}
>
  {#snippet template()}<TasksImplementationBrief brief={shell} />{/snippet}
</Story>

<Story name="Inbox">
  {#snippet template()}<TasksImplementationBrief brief={inbox} />{/snippet}
</Story>

<Story name="Today">
  {#snippet template()}<TasksImplementationBrief brief={today} />{/snippet}
</Story>

<Story name="Tasks overview">
  {#snippet template()}<TasksImplementationBrief brief={tasks} />{/snippet}
</Story>

<Story name="Updates">
  {#snippet template()}<TasksImplementationBrief brief={updates} />{/snippet}
</Story>

<Story name="Lists index">
  {#snippet template()}<TasksImplementationBrief brief={lists} />{/snippet}
</Story>

<Story name="Task detail page">
  {#snippet template()}<TasksImplementationBrief brief={taskDetail} />{/snippet}
</Story>
