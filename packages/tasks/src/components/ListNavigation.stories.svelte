<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import TasksImplementationBrief from "./TasksImplementationBrief.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/List Navigation and Index",
    component: TasksImplementationBrief,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "List navigation gives its row and favourite control independent targets, so changing favourite never opens the list. Its full specification is on this component's Docs page.",
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

  const listNavigation = getComponentImplementationBrief("list-navigation");
</script>

<Story
  name="Implementation placeholder"
  exportName="ImplementationPlaceholder"
  parameters={{ visualDelta: referenceVisualDelta("desktop-lists") }}
>
  {#snippet template()}<TasksImplementationBrief
      brief={listNavigation}
    />{/snippet}
</Story>

<Story
  name="Activate a list or change favourite independently (TODO)"
  exportName="NavigateAndFavouriteTodo"
  tags={["todo"]}
  parameters={{ visualDelta: referenceVisualDelta("desktop-lists") }}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Favourite Design notes" }),
    );
    await expect(canvas.getByText("List favourite changed")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Design notes" }));
    await expect(canvas.getByText("List detail open")).toBeVisible();
  }}
>
  {#snippet template()}<TasksInteractionTodo
      scenario="list-navigation"
    />{/snippet}
</Story>
