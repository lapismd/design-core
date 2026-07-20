<script lang="ts">
  import GripVerticalIcon from "@lucide/svelte/icons/grip-vertical";
  import PanelRightIcon from "@lucide/svelte/icons/panel-right";
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import type { TaskReference, TaskStatus } from "../../lib/contracts.js";
  import "../../lib/tasks-theme.css";

  type Props = {
    task: TaskReference;
    /** Whether this row is the selected list target. */
    selected?: boolean;
    /** Whether a pointer drag is active on this row. */
    dragging?: boolean;
    /** Mobile trailing action visibility. */
    swipeRevealed?: boolean;
    /** Show the reorder grip (desktop/keyboard reorder). */
    showDragHandle?: boolean;
    onComplete?: (taskId: string, status: TaskStatus) => void;
    onSelect?: (taskId: string) => void;
    onOpen?: (taskId: string) => void;
    onSwipeAction?: (taskId: string) => void;
  };

  let {
    task,
    selected = false,
    dragging = false,
    swipeRevealed = false,
    showDragHandle = true,
    onComplete,
    onSelect,
    onOpen,
    onSwipeAction,
  }: Props = $props();

  const done = $derived(task.status === "done");
  const completeLabel = $derived(`Complete ${task.title}`);

  function toggleComplete() {
    onComplete?.(task.id, done ? "open" : "done");
  }

  function select() {
    onSelect?.(task.id);
  }

  function openDetails() {
    onSelect?.(task.id);
    onOpen?.(task.id);
  }

  function onRowKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      openDetails();
      return;
    }
    if (event.key === " ") {
      event.preventDefault();
      toggleComplete();
    }
  }

  function onRowDblClick(event: MouseEvent) {
    // Observed desktop route: double-click does not open detail.
    event.preventDefault();
    select();
  }
</script>

<div
  class="tasks-theme tasks-task-row"
  data-tasks-row
  data-status={task.status}
  data-selected={selected ? "true" : undefined}
  data-dragging={dragging ? "true" : undefined}
  data-due={task.due ?? "none"}
  data-swipe-revealed={swipeRevealed ? "true" : undefined}
>
  {#if showDragHandle}
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      class="tasks-task-row__drag"
      aria-label={`Drag ${task.title}`}
      data-tasks-drag-handle
    >
      <GripVerticalIcon aria-hidden="true" />
    </Button>
  {/if}

  <button
    type="button"
    class="tasks-task-row__complete"
    role="checkbox"
    aria-checked={done}
    aria-label={completeLabel}
    data-tasks-complete
    onclick={(event) => {
      event.stopPropagation();
      toggleComplete();
    }}
  >
    <span class="tasks-task-row__complete-mark" aria-hidden="true"></span>
  </button>

  <button
    type="button"
    class="tasks-task-row__main"
    aria-label={task.title}
    aria-pressed={selected}
    data-tasks-row-target
    onclick={select}
    ondblclick={onRowDblClick}
    onkeydown={onRowKeydown}
  >
    <span class="tasks-task-row__title">{task.title}</span>
    <span class="tasks-task-row__meta">
      {#if task.due}
        <Badge variant="outline">{task.due}</Badge>
      {/if}
      {#if task.priority !== "none"}
        <Badge variant="secondary">{task.priority}</Badge>
      {/if}
      {#each task.labels as label (label)}
        <Badge variant="outline">{label}</Badge>
      {/each}
      {#if task.assignee}
        <span class="tasks-task-row__assignee">{task.assignee}</span>
      {/if}
    </span>
  </button>

  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    class="tasks-task-row__details"
    aria-label="Details"
    data-tasks-details
    onclick={(event) => {
      event.stopPropagation();
      openDetails();
    }}
  >
    <PanelRightIcon aria-hidden="true" />
  </Button>

  {#if swipeRevealed}
    <Button
      type="button"
      variant="destructive"
      size="sm"
      class="tasks-task-row__swipe"
      aria-label="Complete task"
      data-tasks-swipe-action
      onclick={() => {
        onSwipeAction?.(task.id);
        toggleComplete();
      }}
    >
      Complete task
    </Button>
  {/if}
</div>

<style>
  .tasks-task-row {
    display: grid;
    grid-template-columns: auto auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.35rem;
    min-height: var(--tasks-task-row-height);
    padding: 0.25rem 0.5rem;
    border-radius: var(--tasks-radius-control);
    background: var(--tasks-surface);
    color: var(--tasks-ink);
    border: 1px solid transparent;
  }

  .tasks-task-row[data-selected="true"] {
    background: var(--tasks-selection);
    border-color: color-mix(in oklab, var(--tasks-accent) 35%, transparent);
  }

  .tasks-task-row[data-dragging="true"] {
    opacity: 0.72;
  }

  .tasks-task-row[data-status="done"] .tasks-task-row__title {
    text-decoration: line-through;
    color: var(--tasks-muted-ink);
  }

  .tasks-task-row__complete {
    display: inline-grid;
    place-items: center;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 0.25rem;
    border: 1.5px solid var(--tasks-divider);
    background: var(--tasks-surface-raised);
    color: var(--tasks-accent-ink);
    cursor: pointer;
  }

  .tasks-task-row__complete[aria-checked="true"] {
    background: var(--tasks-accent);
    border-color: var(--tasks-accent);
  }

  .tasks-task-row__complete[aria-checked="true"]
    .tasks-task-row__complete-mark {
    width: 0.45rem;
    height: 0.7rem;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(40deg) translateY(-1px);
  }

  .tasks-task-row__complete:focus-visible {
    outline: 2px solid var(--tasks-focus-ring);
    outline-offset: 2px;
  }

  .tasks-task-row__main {
    display: grid;
    gap: 0.2rem;
    min-width: 0;
    padding: 0.2rem 0.35rem;
    border: 0;
    border-radius: calc(var(--tasks-radius-control) - 2px);
    background: transparent;
    color: inherit;
    text-align: start;
    cursor: pointer;
  }

  .tasks-task-row__main:focus-visible {
    outline: 2px solid var(--tasks-focus-ring);
    outline-offset: 2px;
  }

  .tasks-task-row__title {
    font-size: 0.95rem;
    font-weight: 550;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tasks-task-row__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    align-items: center;
    color: var(--tasks-muted-ink);
    font-size: 0.75rem;
  }

  .tasks-task-row__assignee {
    color: var(--tasks-muted-ink);
  }

  .tasks-task-row[data-swipe-revealed="true"] {
    grid-template-columns: auto auto minmax(0, 1fr) auto auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .tasks-task-row,
    .tasks-task-row__complete {
      transition: none;
    }
  }
</style>
