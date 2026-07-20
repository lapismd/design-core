<script lang="ts">
  import { getLocalTimeZone, today } from "@internationalized/date";
  import type { DateValue } from "@internationalized/date";
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as DropdownMenu from "@stevejuma/ui/shadcn/dropdown-menu";
  import * as Popover from "@stevejuma/ui/shadcn/popover";
  import * as Select from "@stevejuma/ui/shadcn/select";
  import { TaskDueCalendar } from "@stevejuma/ui/forms";
  import type {
    TaskListReference,
    TaskPriority,
    TaskReference,
    TasksPropertyChangeHandler,
  } from "../../lib/contracts.js";
  import "../../lib/tasks-theme.css";

  const PRIORITY_OPTIONS = ["none", "low", "medium", "high"] as const;
  const PRIORITY_LABELS: Record<TaskPriority, string> = {
    none: "None",
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  const DUE_LABELS: Record<
    "overdue" | "today" | "tomorrow" | "later" | "none",
    string
  > = {
    overdue: "Overdue",
    today: "Today",
    tomorrow: "Tomorrow",
    later: "Later",
    none: "Add due date",
  };

  const DEFAULT_ASSIGNEES = ["Casey", "Alex", "Jordan"] as const;
  const DEFAULT_LABEL_OPTIONS = [
    "Launch",
    "Reference",
    "Interaction",
    "Accessibility",
  ] as const;
  const NO_LIST_VALUE = "__no-list__";

  type Props = {
    task: TaskReference;
    /** Lists the task could belong to. */
    lists?: readonly TaskListReference[];
    /** List currently containing the task, if any; `TaskReference` has no list field. */
    currentListId?: string | null;
    assigneeOptions?: readonly string[];
    labelOptions?: readonly string[];
    onPropertyChange?: TasksPropertyChangeHandler;
  };

  let {
    task,
    lists = [],
    currentListId = null,
    assigneeOptions = DEFAULT_ASSIGNEES,
    labelOptions = DEFAULT_LABEL_OPTIONS,
    onPropertyChange,
  }: Props = $props();

  let dueOpen = $state(false);
  let assigneeOpen = $state(false);
  let labelsOpen = $state(false);

  const dueLabel = $derived(DUE_LABELS[task.due ?? "none"]);
  const listValue = $derived(currentListId ?? NO_LIST_VALUE);
  const listLabel = $derived(
    currentListId
      ? (lists.find((list) => list.id === currentListId)?.name ?? "No list")
      : "No list",
  );

  function bucketFromDate(
    date: DateValue,
  ): "overdue" | "today" | "tomorrow" | "later" {
    const now = today(getLocalTimeZone());
    const cmp = date.compare(now);
    if (cmp < 0) return "overdue";
    if (cmp === 0) return "today";
    const tomorrow = now.add({ days: 1 });
    return date.compare(tomorrow) === 0 ? "tomorrow" : "later";
  }

  function selectDue(date: DateValue | undefined) {
    if (!date) return;
    onPropertyChange?.(task.id, { key: "due", value: bucketFromDate(date) });
    dueOpen = false;
  }

  function clearDue() {
    onPropertyChange?.(task.id, { key: "due", value: null });
    dueOpen = false;
  }

  function setAssignee(assignee: string | null) {
    onPropertyChange?.(task.id, { key: "assignee", value: assignee });
    assigneeOpen = false;
  }

  function setPriority(priority: TaskPriority) {
    onPropertyChange?.(task.id, { key: "priority", value: priority });
  }

  function toggleLabel(label: string, checked: boolean) {
    const next = checked
      ? [...task.labels, label]
      : task.labels.filter((existing) => existing !== label);
    onPropertyChange?.(task.id, { key: "labels", value: next });
  }

  function setList(value: string) {
    onPropertyChange?.(task.id, {
      key: "list",
      value: value === NO_LIST_VALUE ? null : value,
    });
  }
</script>

<div class="tasks-theme tasks-task-properties" data-tasks-properties>
  <div class="tasks-task-properties__row" data-property="due">
    <span class="tasks-task-properties__label">Due</span>
    <Popover.Root bind:open={dueOpen}>
      <Popover.Trigger>
        {#snippet child({ props })}
          <Button
            {...props}
            type="button"
            variant="outline"
            size="sm"
            class="tasks-task-properties__value"
            aria-label={`Due: ${dueLabel}`}
          >
            {dueLabel}
          </Button>
        {/snippet}
      </Popover.Trigger>
      <Popover.Content align="start" class="tasks-task-properties__due-popover">
        <TaskDueCalendar onValueChange={selectDue} />
        {#if task.due !== null}
          <Button type="button" variant="ghost" size="sm" onclick={clearDue}>
            Clear due date
          </Button>
        {/if}
      </Popover.Content>
    </Popover.Root>
  </div>

  <div class="tasks-task-properties__row" data-property="assignee">
    <span class="tasks-task-properties__label">Assignee</span>
    <DropdownMenu.Root bind:open={assigneeOpen}>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button
            {...props}
            type="button"
            variant="outline"
            size="sm"
            class="tasks-task-properties__value"
            aria-label={`Assignee: ${task.assignee ?? "Unassigned"}`}
          >
            {task.assignee ?? "Unassigned"}
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start">
        <DropdownMenu.Item onSelect={() => setAssignee(null)}>
          Unassigned
        </DropdownMenu.Item>
        {#each assigneeOptions as person (person)}
          <DropdownMenu.Item onSelect={() => setAssignee(person)}>
            {person}
          </DropdownMenu.Item>
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>

  <div class="tasks-task-properties__row" data-property="priority">
    <span class="tasks-task-properties__label">Priority</span>
    <Select.Root
      type="single"
      value={task.priority}
      onValueChange={(next) => setPriority(next as TaskPriority)}
    >
      <Select.Trigger
        aria-label={`Priority: ${PRIORITY_LABELS[task.priority]}`}
        size="sm"
        class="tasks-task-properties__value"
      >
        {PRIORITY_LABELS[task.priority]}
      </Select.Trigger>
      <Select.Content aria-label="Priority options">
        {#each PRIORITY_OPTIONS as option (option)}
          <Select.Item value={option} label={PRIORITY_LABELS[option]}>
            {PRIORITY_LABELS[option]}
          </Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>

  <div class="tasks-task-properties__row" data-property="labels">
    <span class="tasks-task-properties__label">Labels</span>
    <div
      class="tasks-task-properties__value tasks-task-properties__value--labels"
    >
      {#each task.labels as label (label)}
        <Badge variant="outline">{label}</Badge>
      {/each}
      <DropdownMenu.Root bind:open={labelsOpen}>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button {...props} type="button" variant="ghost" size="sm">
              {task.labels.length > 0 ? "Edit labels" : "Add labels"}
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="start">
          {#each labelOptions as label (label)}
            <DropdownMenu.CheckboxItem
              checked={task.labels.includes(label)}
              onCheckedChange={(checked) => toggleLabel(label, checked)}
            >
              {label}
            </DropdownMenu.CheckboxItem>
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  </div>

  <div class="tasks-task-properties__row" data-property="list">
    <span class="tasks-task-properties__label">List</span>
    <Select.Root type="single" value={listValue} onValueChange={setList}>
      <Select.Trigger
        aria-label={`List: ${listLabel}`}
        size="sm"
        class="tasks-task-properties__value"
      >
        {listLabel}
      </Select.Trigger>
      <Select.Content aria-label="List options">
        <Select.Item value={NO_LIST_VALUE} label="No list">No list</Select.Item>
        {#each lists as list (list.id)}
          <Select.Item value={list.id} label={list.name}
            >{list.name}</Select.Item
          >
        {/each}
      </Select.Content>
    </Select.Root>
  </div>
</div>

<style>
  .tasks-task-properties {
    display: grid;
    gap: 0.6rem;
    padding: 0.75rem;
    border-radius: var(--tasks-radius-control);
    background: var(--tasks-surface);
    color: var(--tasks-ink);
  }

  .tasks-task-properties__row {
    display: grid;
    grid-template-columns: 6rem minmax(0, 1fr);
    align-items: center;
    gap: 0.75rem;
    min-height: 2rem;
  }

  .tasks-task-properties__label {
    font-size: 0.8rem;
    font-weight: 550;
    color: var(--tasks-muted-ink);
  }

  .tasks-task-properties__value {
    justify-self: start;
  }

  .tasks-task-properties__value--labels {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
  }

  :global(.tasks-task-properties__due-popover) {
    display: grid;
    gap: 0.5rem;
    width: auto;
  }
</style>
