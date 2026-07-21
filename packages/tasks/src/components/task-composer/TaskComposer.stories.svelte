<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import TaskComposer from "./TaskComposer.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Task Composer",
    component: TaskComposer,

    // Out of scope while Tasks Shell is driven by Superlist reference baselines.
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Inline add-task control. Idle state is a quiet trigger; active state is a labelled draft field with explicit submit/cancel.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { visualDeltaForStory } from "../../lib/visual-delta.js";
  import TaskComposerHarness from "./TaskComposerHarness.svelte";
</script>

<Story
  name="Idle trigger"
  exportName="Idle"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-components-task-composer--idle"),
  }}
>
  {#snippet template()}
    <div class="tasks-theme" style="padding: 1rem; max-width: 28rem">
      <TaskComposer />
    </div>
  {/snippet}
</Story>

<Story
  name="Activates the draft field"
  exportName="Activate"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-task-composer--activate",
    ),
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add task" }));
    await expect(canvas.getByLabelText("Task title")).toBeVisible();
    await expect(canvas.getByLabelText("Task title")).toHaveFocus();
  }}
>
  {#snippet template()}
    <TaskComposerHarness />
  {/snippet}
</Story>

<Story
  name="Submits a non-empty draft"
  exportName="SubmitNonEmpty"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-task-composer--submit-non-empty",
    ),
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add task" }));
    await userEvent.type(
      canvas.getByLabelText("Task title"),
      "Draft release notes",
    );
    await userEvent.keyboard("{Enter}");
    await expect(
      canvas.getByText("Task added: Draft release notes"),
    ).toBeVisible();
    await expect(canvas.getByLabelText("Task title")).toHaveValue("");
    await expect(canvas.getByLabelText("Task title")).toHaveFocus();
  }}
>
  {#snippet template()}
    <TaskComposerHarness />
  {/snippet}
</Story>

<Story
  name="Rejects an empty submit"
  exportName="RejectEmpty"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-task-composer--reject-empty",
    ),
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add task" }));
    const submit = canvas.getByRole("button", { name: "Add task" });
    await expect(submit).toBeDisabled();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByText(/Task added/)).toBeNull();
    await expect(canvas.getByLabelText("Task title")).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskComposerHarness />
  {/snippet}
</Story>

<Story
  name="Escape cancels only a blank draft"
  exportName="EscapeBlankCancel"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-task-composer--escape-blank-cancel",
    ),
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add task" }));
    await userEvent.type(canvas.getByLabelText("Task title"), "Not blank");
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByLabelText("Task title")).toBeVisible();
    await expect(canvas.queryByText("Composer cancelled")).toBeNull();

    await userEvent.clear(canvas.getByLabelText("Task title"));
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByText("Composer cancelled")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Add task" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskComposerHarness />
  {/snippet}
</Story>
