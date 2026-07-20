<script lang="ts">
  import * as Collapsible from "@stevejuma/ui/shadcn/collapsible";
  import { Separator } from "@stevejuma/ui/shadcn/separator";
  import { ScrollArea } from "@stevejuma/ui/shadcn/scroll-area";
  import type {
    TaskReference,
    TaskReorderAction,
    TaskStatus,
    TasksListViewModel,
    TasksSelectionState,
  } from "../../lib/contracts.js";
  import { TasksFeedback } from "../tasks-feedback/index.js";
  import { TaskRow } from "../task-row/index.js";
  import "../../lib/tasks-theme.css";

  type Props = {
    listView: TasksListViewModel;
    tasks: readonly TaskReference[];
    selection?: TasksSelectionState;
    onComplete?: (taskId: string, status: TaskStatus) => void;
    onSelect?: (taskId: string) => void;
    onOpen?: (taskId: string) => void;
    onReorder?: (action: TaskReorderAction) => void;
    onToggleDoneGroup?: (collapsed: boolean) => void;
    children?: import("svelte").Snippet;
  };

  let {
    listView,
    tasks,
    selection = { selectedTaskId: null, openTaskId: null },
    onComplete,
    onSelect,
    onOpen,
    onReorder,
    onToggleDoneGroup,
    children,
  }: Props = $props();

  const taskById = $derived(new Map(tasks.map((task) => [task.id, task])));

  function moveTask(taskId: string, direction: -1 | 1) {
    const ids = [...listView.orderedTaskIds];
    const fromIndex = ids.indexOf(taskId);
    if (fromIndex < 0) return;
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= ids.length) return;
    onReorder?.({
      taskId,
      fromIndex,
      toIndex,
      accepted: true,
    });
  }
</script>

<section class="tasks-theme tasks-task-list" data-tasks-list aria-label="Tasks">
  {#if listView.loading}
    <TasksFeedback state={{ kind: "loading", message: "Loading tasks" }} />
  {:else if listView.empty}
    <TasksFeedback
      state={{ kind: "empty", message: "No tasks in this view" }}
    />
  {:else}
    <ScrollArea class="tasks-task-list__scroll">
      {#each listView.groups as group (group.id)}
        {#if group.id === "done" && group.collapsible}
          <Collapsible.Root
            open={!group.collapsed}
            onOpenChange={(open) => onToggleDoneGroup?.(!open)}
          >
            <div class="tasks-task-list__group-head">
              <Collapsible.Trigger
                class="tasks-task-list__group-trigger"
                aria-label={`${group.collapsed ? "Expand" : "Collapse"} Done`}
              >
                {group.label}
                <span>({group.taskIds.length})</span>
              </Collapsible.Trigger>
            </div>
            <Collapsible.Content>
              {#each group.taskIds as taskId (taskId)}
                {@const task = taskById.get(taskId)}
                {#if task}
                  <TaskRow
                    {task}
                    selected={selection.selectedTaskId === task.id}
                    {onComplete}
                    {onSelect}
                    {onOpen}
                  />
                {/if}
              {/each}
            </Collapsible.Content>
          </Collapsible.Root>
        {:else}
          <div class="tasks-task-list__group" data-group={group.id}>
            <h3 class="tasks-task-list__heading">{group.label}</h3>
            {#each group.taskIds as taskId (taskId)}
              {@const task = taskById.get(taskId)}
              {#if task}
                <div class="tasks-task-list__row">
                  <TaskRow
                    {task}
                    selected={selection.selectedTaskId === task.id}
                    {onComplete}
                    {onSelect}
                    {onOpen}
                  />
                  <div class="tasks-task-list__reorder">
                    <button
                      type="button"
                      aria-label={`Move ${task.title} up`}
                      onclick={() => moveTask(task.id, -1)}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${task.title} down`}
                      onclick={() => moveTask(task.id, 1)}
                    >
                      Down
                    </button>
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
        <Separator />
      {/each}
      {#if children}
        <div class="tasks-task-list__composer">
          {@render children()}
        </div>
      {/if}
    </ScrollArea>
  {/if}
</section>

<style>
  .tasks-task-list {
    display: grid;
    gap: 0.5rem;
    min-height: 12rem;
    padding: 0.75rem;
    border-radius: var(--tasks-radius-shell);
    background: var(--tasks-shell);
    color: var(--tasks-ink);
  }

  .tasks-task-list__heading {
    margin: 0.5rem 0 0.35rem;
    font-size: 0.8rem;
    font-weight: 650;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--tasks-muted-ink);
  }

  :global(.tasks-task-list__group-trigger) {
    display: inline-flex;
    gap: 0.35rem;
    align-items: center;
    margin: 0.5rem 0 0.35rem;
    border: 0;
    background: transparent;
    cursor: pointer;
    color: var(--tasks-muted-ink);
    font-size: 0.8rem;
    font-weight: 650;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  :global(.tasks-task-list__group-trigger:focus-visible) {
    outline: 2px solid var(--tasks-focus-ring);
    outline-offset: 2px;
  }

  .tasks-task-list__row {
    display: grid;
    gap: 0.2rem;
  }

  .tasks-task-list__reorder {
    display: flex;
    gap: 0.35rem;
    padding-inline: 2.5rem;
  }

  .tasks-task-list__reorder button {
    border: 0;
    background: transparent;
    color: var(--tasks-muted-ink);
    font-size: 0.75rem;
    cursor: pointer;
  }

  .tasks-task-list__composer {
    margin-top: 0.75rem;
  }
</style>
