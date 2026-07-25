<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TaskDueCalendar from "./TaskDueCalendar.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Task Due Calendar",
    component: TaskDueCalendar,
    parameters: {
      docs: {
        description: {
          component: "Visual variations for Docs.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { CalendarDate } from "@internationalized/date";

  let value = $state(new CalendarDate(2026, 7, 19));
</script>


<Story
  name="Selected day"
  exportName="SelectedDay"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Calendar with a selected date." },
    },
  }}
>
  {#snippet template()}
    <TaskDueCalendar bind:value />
  {/snippet}
</Story>
