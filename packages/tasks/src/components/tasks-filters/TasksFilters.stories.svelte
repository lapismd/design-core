<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fireEvent, userEvent, within } from "storybook/test";
  import TasksFilters from "./TasksFilters.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Filters and Menus",
    component: TasksFilters,

    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Exclusive filter bar with sort menu and separated destructive clear action.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { visualDeltaForStory } from "../../lib/visual-delta.js";
  import TasksFiltersHarness from "./TasksFiltersHarness.svelte";
</script>

<Story
  name="Select filter"
  exportName="SelectFilter"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-filters-and-menus--select-filter",
    ),
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "For me" }));
    await expect(canvas.getByText("Filter for-me")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksFiltersHarness />
  {/snippet}
</Story>

<Story
  name="Sort and clear completed"
  exportName="SortAndClear"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-filters-and-menus--sort-and-clear",
    ),
  }}
  play={async ({ canvas }) => {
    // bits-ui menu triggers can report pointer-events:none to userEvent while
    // still opening via a trusted click; fireEvent avoids that false negative.
    await fireEvent.click(canvas.getByRole("button", { name: "Sort" }));
    await userEvent.click(
      within(document.body).getByRole("menuitemradio", { name: "Due" }),
    );
    await expect(canvas.getByText("Sort due")).toBeVisible();
    await fireEvent.click(canvas.getByRole("button", { name: "Sort" }));
    await userEvent.click(
      within(document.body).getByRole("menuitem", { name: "Clear completed" }),
    );
    await expect(canvas.getByText("Cleared completed")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksFiltersHarness />
  {/snippet}
</Story>
