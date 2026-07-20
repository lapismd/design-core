<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import TaskProperties from "./TaskProperties.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Task Properties",
    component: TaskProperties,
    tags: ["skip-visual"],
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
  import { createTasksStoryFixture } from "../../lib/story-fixtures.js";
  import { referenceVisualDelta } from "../../lib/story-data.js";
  import TaskPropertiesHarness from "./TaskPropertiesHarness.svelte";

  const fixture = createTasksStoryFixture();
  const filledTask = fixture.activeTask;
  const emptyTask = fixture.tasks.find((task) => task.id === "task-keyboard")!;
</script>

<Story
  name="Filled properties"
  exportName="Filled"
  parameters={{ visualDelta: referenceVisualDelta("desktop-task-detail") }}
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
  parameters={{ visualDelta: referenceVisualDelta("desktop-task-detail") }}
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
  parameters={{ visualDelta: referenceVisualDelta("desktop-task-detail") }}
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: /^Due:/ });
    await userEvent.click(trigger);
    const grid = await within(document.body).findByRole("grid");
    const todayCell = grid.querySelector<HTMLElement>("[data-today]");
    await expect(todayCell).not.toBeNull();
    await userEvent.click(todayCell!);

    await expect(within(document.body).queryByRole("grid")).toBeNull();
    await expect(canvas.getByText("Property changed: due")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Due: Today" }),
    ).toHaveFocus();
  }}
>
  {#snippet template()}
    <TaskPropertiesHarness task={filledTask} lists={fixture.lists} />
  {/snippet}
</Story>

<Story
  name="Opens and commits a priority"
  exportName="ChangePriority"
  parameters={{ visualDelta: referenceVisualDelta("desktop-task-detail") }}
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("combobox", { name: "Priority: High" });
    await userEvent.click(trigger);
    await userEvent.click(
      within(document.body).getByRole("option", { name: "Medium" }),
    );
    await expect(canvas.getByText("Property changed: priority")).toBeVisible();
    await expect(
      canvas.getByRole("combobox", { name: "Priority: Medium" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskPropertiesHarness task={filledTask} lists={fixture.lists} />
  {/snippet}
</Story>

<Story
  name="Toggles a label without closing the menu"
  exportName="ToggleLabel"
  parameters={{ visualDelta: referenceVisualDelta("desktop-task-detail") }}
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
