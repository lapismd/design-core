<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import TasksImplementationBrief from "./TasksImplementationBrief.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Filters and Menus",
    component: TasksImplementationBrief,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Filtering composes the host menu primitives and keeps selection behavior with those primitives. Its full specification is on this component's Docs page.",
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

  const filtersMenus = getComponentImplementationBrief("tasks-filters-menus");
</script>

<Story
  name="Implementation placeholder"
  exportName="ImplementationPlaceholder"
  parameters={{ visualDelta: referenceVisualDelta("desktop-tasks") }}
>
  {#snippet template()}<TasksImplementationBrief
      brief={filtersMenus}
    />{/snippet}
</Story>

<Story
  name="Open and select a filter (TODO)"
  exportName="OpenFilterTodo"
  tags={["todo"]}
  parameters={{ visualDelta: referenceVisualDelta("desktop-tasks") }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Filter tasks" }));
    await expect(canvas.getByText("Filter menu open")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Assigned to me" }),
    );
    await expect(canvas.getByText("Filter menu closed")).toBeVisible();
  }}
>
  {#snippet template()}<TasksInteractionTodo scenario="filters" />{/snippet}
</Story>
