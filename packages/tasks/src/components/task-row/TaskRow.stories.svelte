<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import TaskRow from "./TaskRow.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Task Row",
    component: TaskRow,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Controlled task row with independent completion, selection, and explicit detail opening.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { createTasksStoryFixture } from "../../lib/story-fixtures.js";
  import { referenceVisualDelta } from "../../lib/story-data.js";
  import TaskRowHarness from "./TaskRowHarness.svelte";

  const fixture = createTasksStoryFixture();
  const task = fixture.activeTask;
</script>

<Story
  name="Default"
  exportName="Default"
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
>
  {#snippet template()}
    <div class="tasks-theme" style="padding: 1rem; max-width: 40rem">
      <TaskRow {task} selected={false} />
    </div>
  {/snippet}
</Story>

<Story
  name="Complete independently"
  exportName="CompleteIndependently"
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("checkbox", {
        name: "Complete Review the launch brief",
      }),
    );
    await expect(canvas.getByText("Task completed")).toBeVisible();
    await expect(
      canvas.getByRole("checkbox", {
        name: "Complete Review the launch brief",
      }),
    ).toHaveAttribute("aria-checked", "true");
  }}
>
  {#snippet template()}
    <TaskRowHarness {task} mode="complete" />
  {/snippet}
</Story>

<Story
  name="Click selects and details opens explicitly"
  exportName="SelectAndOpen"
  parameters={{ visualDelta: referenceVisualDelta("task-open-motion") }}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Review the launch brief" }),
    );
    await expect(canvas.getByText("Task selected")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Details" }));
    await expect(canvas.getByText("Task detail open")).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskRowHarness {task} mode="select-open" />
  {/snippet}
</Story>

<Story
  name="Double click keeps selection parity"
  exportName="DoubleClickParity"
  parameters={{ visualDelta: referenceVisualDelta("task-open-motion") }}
  play={async ({ canvas }) => {
    const row = canvas.getByRole("button", {
      name: "Review the launch brief",
    });
    await userEvent.dblClick(row);
    await expect(canvas.getByText("Task selected")).toBeVisible();
    await expect(canvas.queryByText("Task detail open")).toBeNull();
  }}
>
  {#snippet template()}
    <TaskRowHarness {task} mode="double-click" />
  {/snippet}
</Story>

<Story
  name="Enter opens and Space completes"
  exportName="KeyboardSplit"
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
  play={async ({ canvas }) => {
    const row = canvas.getByRole("button", {
      name: "Review the launch brief",
    });
    row.focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByText("Task detail open")).toBeVisible();
    await userEvent.keyboard(" ");
    await expect(
      canvas.getByRole("checkbox", {
        name: "Complete Review the launch brief",
      }),
    ).toHaveAttribute("aria-checked", "true");
  }}
>
  {#snippet template()}
    <TaskRowHarness {task} mode="keyboard" />
  {/snippet}
</Story>

<Story
  name="Drag handle is available"
  exportName="DragHandle"
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", {
        name: "Drag Review the launch brief",
      }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskRowHarness {task} dragging />
  {/snippet}
</Story>

<Story
  name="Swipe reveals complete action"
  exportName="SwipeReveal"
  parameters={{ visualDelta: referenceVisualDelta("mobile-swipe-motion") }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Complete task" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskRowHarness {task} swipeRevealed />
  {/snippet}
</Story>
