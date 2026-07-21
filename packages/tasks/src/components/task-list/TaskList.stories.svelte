<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import TaskList from "./TaskList.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Task List",
    component: TaskList,

    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Grouped controlled task collection with Done collapse, composer slot, and reorder affordances.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { visualDeltaForStory } from "../../lib/visual-delta.js";
  import TaskListHarness from "./TaskListHarness.svelte";
</script>

<Story
  name="Default groups"
  exportName="DefaultGroups"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-task-list--default-groups",
    ),
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("Tasks")).toBeVisible();
    await expect(canvas.getByText("Overdue")).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskListHarness mode="default" />
  {/snippet}
</Story>

<Story
  name="Collapse Done"
  exportName="CollapseDone"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-task-list--collapse-done",
    ),
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Done collapsed")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Expand Done" }));
    await expect(canvas.getByText("Done expanded")).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskListHarness mode="collapse" />
  {/snippet}
</Story>

<Story
  name="Select row"
  exportName="SelectRow"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-components-task-list--select-row"),
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByText("Review the launch brief today"));
    await expect(canvas.getByText("Selected task-brief")).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskListHarness />
  {/snippet}
</Story>

<Story
  name="Empty"
  exportName="Empty"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-components-task-list--empty"),
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("No tasks in this view")).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskListHarness mode="empty" />
  {/snippet}
</Story>

<Story
  name="Loading"
  exportName="Loading"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-components-task-list--loading"),
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Loading tasks")).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskListHarness mode="loading" />
  {/snippet}
</Story>
