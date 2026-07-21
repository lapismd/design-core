<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ListNavigation from "./ListNavigation.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/List Navigation and Index",
    component: ListNavigation,

    // Out of scope while Tasks Shell is driven by Superlist reference baselines.
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Sidebar destinations with activate targets independent from favourite controls.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { visualDeltaForStory } from "../../lib/visual-delta.js";
  import ListNavigationHarness from "./ListNavigationHarness.svelte";
</script>

<Story
  name="Activate destination"
  exportName="ActivateDestination"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-list-navigation-and-index--activate-destination",
    ),
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Today" }));
    await expect(canvas.getByText("Active today")).toBeVisible();
  }}
>
  {#snippet template()}
    <ListNavigationHarness />
  {/snippet}
</Story>

<Story
  name="Favourite independently"
  exportName="FavouriteIndependently"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-list-navigation-and-index--favourite-independently",
    ),
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Favourite on")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Favourite Tasks UI Reference" }),
    );
    await expect(canvas.getByText("Favourite off")).toBeVisible();
    await expect(canvas.getByText("Active inbox")).toBeVisible();
  }}
>
  {#snippet template()}
    <ListNavigationHarness />
  {/snippet}
</Story>

<Story
  name="Create list"
  exportName="CreateList"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-list-navigation-and-index--create-list",
    ),
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "New list" }));
    await expect(canvas.getByText("Create list requested")).toBeVisible();
  }}
>
  {#snippet template()}
    <ListNavigationHarness />
  {/snippet}
</Story>
