<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import TaskDetail from "./TaskDetail.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Task Detail",
    component: TaskDetail,

    // Out of scope while Tasks Shell is driven by Superlist reference baselines.
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Controlled selected-task editor: back/completion header, an inline title editor, TaskProperties, a note field, and a presentational activity placeholder. Opening moves focus to the title heading; Escape (when not editing the title) calls back.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { visualDeltaForStory } from "../../lib/visual-delta.js";
  import { createTasksStoryFixture } from "../../lib/story-fixtures.js";
  import TaskDetailHarness from "./TaskDetailHarness.svelte";

  const fixture = createTasksStoryFixture();
  const filledTask = fixture.activeTask;
</script>

<Story
  name="Open focuses the title heading"
  exportName="OpenFocusesHeading"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-task-detail--open-focuses-heading",
    ),
  }}
  play={async ({ canvas }) => {
    const heading = canvas.getByRole("heading", {
      name: "Review the launch brief today",
    });
    await expect(heading).toHaveFocus();
  }}
>
  {#snippet template()}
    <TaskDetailHarness task={filledTask} lists={fixture.lists} />
  {/snippet}
</Story>

<Story
  name="Commits an edited title"
  exportName="CommitTitle"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-task-detail--commit-title",
    ),
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Edit title" }));
    const input = canvas.getByRole("textbox", { name: "Task title" });
    await userEvent.clear(input);
    await userEvent.type(input, "Review the launch brief this week{Enter}");
    await expect(
      canvas.getByRole("heading", {
        name: "Review the launch brief this week",
      }),
    ).toBeVisible();
    await expect(
      canvas.getByText("Title changed: Review the launch brief this week"),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskDetailHarness task={filledTask} lists={fixture.lists} />
  {/snippet}
</Story>

<Story
  name="Escape cancels the title edit without closing"
  exportName="EscapeCancelsTitleEdit"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-task-detail--escape-cancels-title-edit",
    ),
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Edit title" }));
    const input = canvas.getByRole("textbox", { name: "Task title" });
    await userEvent.clear(input);
    await userEvent.type(input, "Discard this draft");
    await userEvent.keyboard("{Escape}");
    await expect(
      canvas.getByRole("heading", {
        name: "Review the launch brief today",
      }),
    ).toBeVisible();
    await expect(canvas.queryByText("Returned to task list")).toBeNull();
  }}
>
  {#snippet template()}
    <TaskDetailHarness task={filledTask} lists={fixture.lists} />
  {/snippet}
</Story>

<Story
  name="Escape and back return to the list"
  exportName="EscapeAndBackReturn"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-task-detail--escape-and-back-return",
    ),
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", {
        name: "Review the launch brief today",
      }),
    ).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByText("Returned to task list")).toBeVisible();
    await expect(canvas.getByText("Back requested")).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskDetailHarness task={filledTask} lists={fixture.lists} />
  {/snippet}
</Story>

<Story
  name="Back button returns to the list"
  exportName="BackButtonReturns"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-task-detail--back-button-returns",
    ),
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Back to list" }));
    await expect(canvas.getByText("Returned to task list")).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskDetailHarness task={filledTask} lists={fixture.lists} />
  {/snippet}
</Story>
