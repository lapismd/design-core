<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fireEvent, userEvent } from "storybook/test";
  import TasksImplementationBrief from "../TasksImplementationBrief.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Task Row",
    component: TasksImplementationBrief,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "The row contract owns selection, completion, explicit detail opening, keyboard behavior, reorder, and mobile actions. Its complete specification is rendered on this component's Docs page.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import TasksInteractionTodo from "../TasksInteractionTodo.svelte";
  import {
    getComponentImplementationBrief,
    referenceVisualDelta,
  } from "../../lib/story-data.js";

  const taskRow = getComponentImplementationBrief("task-row");
</script>

<Story
  name="Implementation placeholder"
  exportName="ImplementationPlaceholder"
  parameters={{ visualDelta: referenceVisualDelta("mobile-swipe-motion") }}
>
  {#snippet template()}
    <TasksImplementationBrief brief={taskRow} />
  {/snippet}
</Story>

<Story
  name="Complete independently (TODO)"
  exportName="CompleteIndependentlyTodo"
  tags={["todo"]}
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("checkbox", {
        name: "Complete Review the launch brief",
      }),
    );
    await expect(canvas.getByText("Task completed")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksInteractionTodo scenario="task-row" />
  {/snippet}
</Story>

<Story
  name="Click selects and details opens explicitly (TODO)"
  exportName="SelectAndOpenTodo"
  tags={["todo"]}
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
    <TasksInteractionTodo scenario="task-row" />
  {/snippet}
</Story>

<Story
  name="Double click preserves selection route (TODO)"
  exportName="DoubleClickSelectionTodo"
  tags={["todo"]}
  parameters={{ visualDelta: referenceVisualDelta("task-open-motion") }}
  play={async ({ canvas }) => {
    await userEvent.dblClick(
      canvas.getByRole("button", { name: "Review the launch brief" }),
    );
    await expect(canvas.getByText("Task selected")).toBeVisible();
    await expect(
      canvas.queryByText("Task detail open"),
    ).not.toBeInTheDocument();
  }}
>
  {#snippet template()}
    <TasksInteractionTodo scenario="task-row" />
  {/snippet}
</Story>

<Story
  name="Keyboard selection and completion split (TODO)"
  exportName="KeyboardSplitTodo"
  tags={["todo"]}
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
  play={async ({ canvas }) => {
    const row = canvas.getByRole("button", { name: "Review the launch brief" });
    row.focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByText("Task selected")).toBeVisible();

    const completion = canvas.getByRole("checkbox", {
      name: "Complete Review the launch brief",
    });
    completion.focus();
    await userEvent.keyboard(" ");
    await expect(canvas.getByText("Task completed")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksInteractionTodo scenario="task-row" />
  {/snippet}
</Story>

<Story
  name="Drag reorder (TODO)"
  exportName="DragReorderTodo"
  tags={["todo"]}
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
  play={async ({ canvas }) => {
    const dragHandle = canvas.getByRole("button", {
      name: "Drag Review the launch brief",
    });
    await fireEvent.pointerDown(dragHandle, { clientY: 0 });
    await fireEvent.pointerUp(dragHandle, { clientY: 48 });
    await expect(canvas.getByText("Task reordered")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksInteractionTodo scenario="reorder" />
  {/snippet}
</Story>

<Story
  name="Mobile swipe reveals trailing action (TODO)"
  exportName="SwipeActionTodo"
  tags={["todo"]}
  parameters={{ visualDelta: referenceVisualDelta("mobile-swipe-motion") }}
  play={async ({ canvas }) => {
    const row = canvas.getByRole("button", {
      name: "Swipe Review the launch brief left to reveal actions",
    });
    await fireEvent.pointerDown(row, { clientX: 160 });
    await fireEvent.pointerUp(row, { clientX: 96 });
    await expect(
      canvas.getByRole("button", { name: "Complete task" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksInteractionTodo scenario="swipe-row" />
  {/snippet}
</Story>
