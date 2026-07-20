<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import TasksImplementationBrief from "./TasksImplementationBrief.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Feedback and Empty States",
    component: TasksImplementationBrief,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Feedback states communicate empty, loading, error, and retry paths without product-specific persistence. Its full specification is on this component's Docs page.",
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

  const feedback = getComponentImplementationBrief("tasks-feedback");
</script>

<Story
  name="Implementation placeholder"
  exportName="ImplementationPlaceholder"
  parameters={{ visualDelta: referenceVisualDelta("desktop-updates") }}
>
  {#snippet template()}<TasksImplementationBrief brief={feedback} />{/snippet}
</Story>

<Story
  name="Retry feedback action (TODO)"
  exportName="RetryTodo"
  tags={["todo"]}
  parameters={{ visualDelta: referenceVisualDelta("desktop-updates") }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Retry" }));
    await expect(canvas.getByText("Retry requested")).toBeVisible();
  }}
>
  {#snippet template()}<TasksInteractionTodo scenario="feedback" />{/snippet}
</Story>
