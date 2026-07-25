<script lang="ts">
  import "./TaskDueCalendar.css";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import { Calendar } from "bits-ui";
  import type { DateValue } from "@internationalized/date";

  let {
    value = $bindable<DateValue | undefined>(),
    onValueChange = () => {},
  }: {
    value?: DateValue;
    onValueChange?: (value: DateValue | undefined) => void;
  } = $props();
</script>

<div class="task-due-calendar" data-ui-component="task-due-calendar" data-ui-part="task-due-calendar">
  <Calendar.Root
    bind:value={value as never}
    type="single"
    weekdayFormat="short"
    onValueChange={(nextValue) => {
      onValueChange(nextValue);
    }}
  >
    {#snippet children({ months, weekdays })}
      {#each months as month (month)}
        <div class="task-due-calendar__month">
          <Calendar.Header class="task-due-calendar__header" role="group">
            <Calendar.PrevButton class="task-due-calendar__nav">
              <ChevronLeftIcon />
            </Calendar.PrevButton>
            <Calendar.Heading class="task-due-calendar__heading" />
            <Calendar.NextButton class="task-due-calendar__nav">
              <ChevronRightIcon />
            </Calendar.NextButton>
          </Calendar.Header>
          <Calendar.Grid class="task-due-calendar__grid">
            <Calendar.GridHead>
              <Calendar.GridRow class="task-due-calendar__weekdays">
                {#each weekdays as weekday, index (index)}
                  <Calendar.HeadCell class="task-due-calendar__weekday">
                    {weekday.slice(0, 2)}
                  </Calendar.HeadCell>
                {/each}
              </Calendar.GridRow>
            </Calendar.GridHead>
            <Calendar.GridBody>
              {#each month.weeks as weekDates (weekDates)}
                <Calendar.GridRow class="task-due-calendar__week">
                  {#each weekDates as date (date)}
                    <Calendar.Cell
                      {date}
                      month={month.value}
                      class="task-due-calendar__cell"
                    >
                      <Calendar.Day class="task-due-calendar__day" />
                    </Calendar.Cell>
                  {/each}
                </Calendar.GridRow>
              {/each}
            </Calendar.GridBody>
          </Calendar.Grid>
        </div>
      {/each}
    {/snippet}
  </Calendar.Root>
</div>
