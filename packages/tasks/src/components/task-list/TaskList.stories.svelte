<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import TaskList from "./TaskList.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Task List",
    component: TaskList,
    tags: ["skip-visual"],
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
  import { referenceVisualDelta } from "../../lib/story-data.js";
  import TaskListHarness from "./TaskListHarness.svelte";
</script>

<Story
  name="Default groups"
  exportName="DefaultGroups"
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
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
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
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
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Review the launch brief" }),
    );
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
  parameters={{ visualDelta: referenceVisualDelta("desktop-updates") }}
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
  parameters={{ visualDelta: referenceVisualDelta("desktop-updates") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Loading tasks")).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskListHarness mode="loading" />
  {/snippet}
</Story>
