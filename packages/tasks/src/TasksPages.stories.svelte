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
  import {
    pageImplementationBriefs,
    referenceVisualDelta,
  } from "./lib/story-data.js";

  const byId = Object.fromEntries(
    pageImplementationBriefs.map((brief) => [brief.id, brief]),
  );
  const shell = byId.shell;
  const inbox = byId.inbox;
  const today = byId.today;
  const tasks = byId.tasks;
  const updates = byId.updates;
  const lists = byId.lists;
  const listDetail = byId["list-detail"];
  const taskDetail = byId["task-detail-page"];
</script>

<Story
  name="Tasks shell"
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Tasks shell")).toBeVisible();
    await expect(canvas.getByText("Sidebar")).toBeVisible();
  }}
>
  {#snippet template()}<TasksImplementationBrief brief={shell} />{/snippet}
</Story>

<Story
  name="Inbox"
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
>
  {#snippet template()}<TasksImplementationBrief brief={inbox} />{/snippet}
</Story>

<Story
  name="Today"
  parameters={{ visualDelta: referenceVisualDelta("desktop-today") }}
>
  {#snippet template()}<TasksImplementationBrief brief={today} />{/snippet}
</Story>

<Story
  name="Tasks overview"
  parameters={{ visualDelta: referenceVisualDelta("desktop-tasks") }}
>
  {#snippet template()}<TasksImplementationBrief brief={tasks} />{/snippet}
</Story>

<Story
  name="Updates"
  parameters={{ visualDelta: referenceVisualDelta("desktop-updates") }}
>
  {#snippet template()}<TasksImplementationBrief brief={updates} />{/snippet}
</Story>

<Story
  name="Lists index"
  parameters={{ visualDelta: referenceVisualDelta("desktop-lists") }}
>
  {#snippet template()}<TasksImplementationBrief brief={lists} />{/snippet}
</Story>

<Story
  name="List detail"
  parameters={{ visualDelta: referenceVisualDelta("desktop-list-detail") }}
>
  {#snippet template()}<TasksImplementationBrief brief={listDetail} />{/snippet}
</Story>

<Story
  name="Task detail page"
  parameters={{ visualDelta: referenceVisualDelta("desktop-task-detail") }}
>
  {#snippet template()}<TasksImplementationBrief brief={taskDetail} />{/snippet}
</Story>
