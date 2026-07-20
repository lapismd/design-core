<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fireEvent, userEvent } from "storybook/test";
  import TasksImplementationBrief from "./TasksImplementationBrief.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Task Detail",
    component: TasksImplementationBrief,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "The detail contract controls opening focus, property editing, Escape and back return, and narrow-screen pager return. Its full specification is on this component's Docs page.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import TasksInteractionTodo from "./TasksInteractionTodo.svelte";
  import {
    getComponentImplementationBrief,
    referenceVisualDelta,
  } from "../lib/story-data.js";

  const taskDetail = getComponentImplementationBrief("task-detail");
</script>

<Story
  name="Implementation placeholder"
  exportName="ImplementationPlaceholder"
  parameters={{ visualDelta: referenceVisualDelta("desktop-task-detail") }}
>
  {#snippet template()}<TasksImplementationBrief brief={taskDetail} />{/snippet}
</Story>

<Story
  name="Focus on open and Escape returns (TODO)"
  exportName="FocusAndEscapeTodo"
  tags={["todo"]}
  parameters={{ visualDelta: referenceVisualDelta("desktop-task-detail") }}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Open task detail" }),
    );
    const heading = canvas.getByRole("heading", { name: "Task detail" });
    await expect(heading).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByText("Returned to task list")).toBeVisible();
  }}
>
  {#snippet template()}<TasksInteractionTodo
      scenario="detail-return"
    />{/snippet}
</Story>

<Story
  name="Mobile back and right swipe return (TODO)"
  exportName="MobileReturnTodo"
  tags={["todo"]}
  parameters={{ visualDelta: referenceVisualDelta("mobile-inbox") }}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Open task detail" }),
    );
    const detail = canvas.getByRole("dialog", { name: "Task detail" });
    await fireEvent.pointerDown(detail, { clientX: 24 });
    await fireEvent.pointerUp(detail, { clientX: 88 });
    await expect(canvas.getByText("Returned to task list")).toBeVisible();
  }}
>
  {#snippet template()}<TasksInteractionTodo
      scenario="detail-return"
    />{/snippet}
</Story>
