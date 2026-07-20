<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import TasksImplementationBrief from "./TasksImplementationBrief.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Task Composer",
    component: TasksImplementationBrief,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "The inline composer makes a syntactic task draft and sends it to an owner-controlled create callback. Its full specification is on this component's Docs page.",
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

  const taskComposer = getComponentImplementationBrief("task-composer");
</script>

<Story
  name="Implementation placeholder"
  exportName="ImplementationPlaceholder"
  parameters={{ visualDelta: referenceVisualDelta("desktop-list-detail") }}
>
  {#snippet template()}<TasksImplementationBrief
      brief={taskComposer}
    />{/snippet}
</Story>

<Story
  name="Commit a draft (TODO)"
  exportName="CommitDraftTodo"
  tags={["todo"]}
  parameters={{ visualDelta: referenceVisualDelta("desktop-list-detail") }}
  play={async ({ canvas }) => {
    await userEvent.type(
      canvas.getByLabelText("Task title"),
      "Draft release notes",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Add task" }));
    await expect(
      canvas.getByText("Task added: Draft release notes"),
    ).toBeVisible();
  }}
>
  {#snippet template()}<TasksInteractionTodo scenario="composer" />{/snippet}
</Story>
