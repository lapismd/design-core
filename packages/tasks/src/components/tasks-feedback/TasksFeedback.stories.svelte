<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import TasksFeedback from "./TasksFeedback.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Feedback and Empty States",
    component: TasksFeedback,

    // Out of scope while Tasks Shell is driven by Superlist reference baselines.
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Honest loading, empty, error, and update feedback for TasksFeedbackState kinds: empty, loading, preserving-error, status, and undo.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { visualDeltaForStory } from "../../lib/visual-delta.js";
  import TasksFeedbackHarness from "./TasksFeedbackHarness.svelte";
</script>

<Story
  name="Empty updates"
  exportName="Empty"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-feedback-and-empty-states--empty",
    ),
  }}
>
  {#snippet template()}
    <div class="tasks-theme" style="padding: 1rem; max-width: 28rem">
      <TasksFeedback state={{ kind: "empty", message: "No updates yet" }} />
    </div>
  {/snippet}
</Story>

<Story
  name="Loading rows"
  exportName="Loading"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-feedback-and-empty-states--loading",
    ),
  }}
>
  {#snippet template()}
    <div class="tasks-theme" style="padding: 1rem; max-width: 28rem">
      <TasksFeedback state={{ kind: "loading", message: "Loading tasks" }} />
    </div>
  {/snippet}
</Story>

<Story
  name="Preserving error with retry"
  exportName="PreservingError"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-feedback-and-empty-states--preserving-error",
    ),
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Couldn't refresh updates")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Retry" }));
    await expect(canvas.getByText("Retry requested")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksFeedbackHarness
      state={{
        kind: "preserving-error",
        message: "Couldn't refresh updates",
        retryable: true,
      }}
    />
  {/snippet}
</Story>

<Story
  name="Status while syncing"
  exportName="Status"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-feedback-and-empty-states--status",
    ),
  }}
>
  {#snippet template()}
    <div class="tasks-theme" style="padding: 1rem; max-width: 28rem">
      <TasksFeedback state={{ kind: "status", message: "Syncing updates" }} />
    </div>
  {/snippet}
</Story>

<Story
  name="Undo a completed action"
  exportName="Undo"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-feedback-and-empty-states--undo",
    ),
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
    await expect(canvas.getByText("Undo requested")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksFeedbackHarness
      state={{
        kind: "undo",
        message: "Task marked done",
        undoable: true,
      }}
    />
  {/snippet}
</Story>
