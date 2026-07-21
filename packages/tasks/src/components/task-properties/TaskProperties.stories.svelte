<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import TaskProperties from "./TaskProperties.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Task Properties",
    component: TaskProperties,

    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Labelled property rows for due date, assignee, priority, labels, and list membership. Every row keeps its current value and action visible.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { visualDeltaForStory } from "../../lib/visual-delta.js";
  import { createTasksStoryFixture } from "../../lib/story-fixtures.js";
  import TaskPropertiesHarness from "./TaskPropertiesHarness.svelte";

  const fixture = createTasksStoryFixture();
  const filledTask = fixture.activeTask;
  const emptyTask = fixture.tasks.find((task) => task.id === "task-keyboard")!;
</script>

<Story
  name="Filled properties"
  exportName="Filled"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-task-properties--filled",
    ),
  }}
>
  {#snippet template()}
    <div class="tasks-theme" style="padding: 1rem; max-width: 26rem">
      <TaskProperties task={filledTask} lists={fixture.lists} />
    </div>
  {/snippet}
</Story>

<Story
  name="Empty properties"
  exportName="Empty"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-components-task-properties--empty"),
  }}
>
  {#snippet template()}
    <div class="tasks-theme" style="padding: 1rem; max-width: 26rem">
      <TaskProperties task={emptyTask} lists={fixture.lists} />
    </div>
  {/snippet}
</Story>

<Story
  name="Opens and commits a due date"
  exportName="ChangeDue"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-task-properties--change-due",
    ),
  }}
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: /^Due:/ });
    await userEvent.click(trigger);
    await userEvent.click(
      within(document.body).getByRole("button", { name: "Clear due date" }),
    );
    await expect(canvas.getByText("Property changed: due")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Due: Add due date" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskPropertiesHarness task={filledTask} lists={fixture.lists} />
  {/snippet}
</Story>

<Story
  name="Opens and commits a priority"
  exportName="ChangePriority"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-task-properties--change-priority",
    ),
  }}
  play={async ({ canvas }) => {
    const trigger = canvas.getByLabelText("Priority: High");
    await userEvent.click(trigger);
    await userEvent.click(
      within(document.body).getByRole("option", { name: "Medium" }),
    );
    await expect(canvas.getByText("Property changed: priority")).toBeVisible();
    await expect(canvas.getByLabelText("Priority: Medium")).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskPropertiesHarness task={filledTask} lists={fixture.lists} />
  {/snippet}
</Story>

<Story
  name="Toggles a label without closing the menu"
  exportName="ToggleLabel"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-task-properties--toggle-label",
    ),
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Edit labels" }));
    const option = within(document.body).getByRole("menuitemcheckbox", {
      name: "Interaction",
    });
    await expect(option).toHaveAttribute("aria-checked", "false");
    await userEvent.click(option);
    await expect(canvas.getByText("Property changed: labels")).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskPropertiesHarness task={filledTask} lists={fixture.lists} />
  {/snippet}
</Story>
