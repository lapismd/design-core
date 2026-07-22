<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import { CalendarDate } from "@internationalized/date";
  import TaskDueCalendar from "./TaskDueCalendar.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Task Due Calendar",
    component: TaskDueCalendar,
    parameters: {
      docs: {
        description: {
          component: "Calendar date picker used by task due-date fields.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state(new CalendarDate(2026, 7, 19));
</script>

<Story
  name="Shows a selected date"
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("grid")).toBeVisible();
  }}
>
  {#snippet template()}
    <TaskDueCalendar bind:value />
  {/snippet}
</Story>
