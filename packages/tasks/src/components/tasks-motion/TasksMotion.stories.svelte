<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fireEvent } from "storybook/test";
  import TasksSwipeGesture from "./TasksSwipeGesture.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Motion and Gestures",
    component: TasksSwipeGesture,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Pointer gesture controller wiring `shouldRevealRowSwipe`, `shouldCancelSwipeForScroll`, and `shouldPagerBack` from `lib/motion.ts` into row swipe reveal and pager-back behavior. Every gesture keeps a pointer/keyboard button equivalent on the wrapped content.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { referenceVisualDelta } from "../../lib/story-data.js";
  import TasksSwipeGestureHarness from "./TasksSwipeGestureHarness.svelte";
</script>

<Story
  name="Reveal a row action after the swipe threshold"
  exportName="SwipeThreshold"
  parameters={{ visualDelta: referenceVisualDelta("mobile-swipe-motion") }}
  play={async ({ canvas }) => {
    const row = canvas.getByLabelText("Review the launch brief today");
    await fireEvent.pointerDown(row, { clientX: 160, clientY: 40 });
    await fireEvent.pointerUp(row, { clientX: 96, clientY: 40 });
    await expect(canvas.getByText("Trailing action revealed")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Complete task" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksSwipeGestureHarness mode="row-swipe" />
  {/snippet}
</Story>

<Story
  name="Below the threshold does not reveal"
  exportName="SwipeBelowThreshold"
  parameters={{ visualDelta: referenceVisualDelta("mobile-swipe-motion") }}
  play={async ({ canvas }) => {
    const row = canvas.getByLabelText("Review the launch brief today");
    await fireEvent.pointerDown(row, { clientX: 160, clientY: 40 });
    await fireEvent.pointerUp(row, { clientX: 145, clientY: 40 });
    await expect(canvas.queryByText("Trailing action revealed")).toBeNull();
  }}
>
  {#snippet template()}
    <TasksSwipeGestureHarness mode="row-swipe" />
  {/snippet}
</Story>

<Story
  name="Vertical scroll intent cancels the swipe"
  exportName="ScrollIntentCancels"
  parameters={{ visualDelta: referenceVisualDelta("mobile-swipe-motion") }}
  play={async ({ canvas }) => {
    const row = canvas.getByLabelText("Review the launch brief today");
    await fireEvent.pointerDown(row, { clientX: 160, clientY: 40 });
    await fireEvent.pointerMove(row, { clientX: 155, clientY: 90 });
    await expect(
      canvas.getByText("Swipe cancelled for scroll intent"),
    ).toBeVisible();
    await fireEvent.pointerUp(row, { clientX: 96, clientY: 90 });
    await expect(canvas.queryByText("Trailing action revealed")).toBeNull();
  }}
>
  {#snippet template()}
    <TasksSwipeGestureHarness mode="row-swipe" />
  {/snippet}
</Story>

<Story
  name="Pager back after the horizontal threshold"
  exportName="PagerBackThreshold"
  parameters={{ visualDelta: referenceVisualDelta("task-open-motion") }}
  play={async ({ canvas }) => {
    const surface = canvas.getByText("Task detail pane");
    await fireEvent.pointerDown(surface, { clientX: 24, clientY: 40 });
    await fireEvent.pointerUp(surface, { clientX: 88, clientY: 40 });
    await expect(canvas.getByText("Pane list")).toBeVisible();
    await expect(canvas.getByText("Task list pane")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksSwipeGestureHarness mode="pager-back" />
  {/snippet}
</Story>
