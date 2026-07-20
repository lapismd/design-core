<script lang="ts">
  import type {
    TaskReference,
    TasksSelectionState,
  } from "../../lib/contracts.js";
  import {
    buildGroupedListView,
    createTasksStoryFixture,
  } from "../../lib/story-fixtures.js";
  import { TaskComposer } from "../task-composer/index.js";
  import TaskList from "./TaskList.svelte";

  let {
    mode = "default",
  }: {
    mode?: "default" | "empty" | "loading" | "collapse";
  } = $props();

  const fixture = createTasksStoryFixture();
  let tasks = $state<TaskReference[]>([...fixture.tasks]);
  let doneCollapsed = $state(true);
  let selection = $state<TasksSelectionState>({
    selectedTaskId: null,
    openTaskId: null,
  });
  let lastReorder = $state("");

  const listView = $derived(
    mode === "empty"
      ? {
          ...buildGroupedListView([]),
          empty: true,
          loading: false,
        }
      : mode === "loading"
        ? {
            ...buildGroupedListView(tasks),
            loading: true,
            empty: false,
          }
        : buildGroupedListView(tasks, { doneCollapsed }),
  );
</script>

<div style="padding: 1rem; max-width: 36rem">
  <TaskList
    {listView}
    {tasks}
    {selection}
    onSelect={(id) => {
      selection = { ...selection, selectedTaskId: id };
    }}
    onOpen={(id) => {
      selection = { selectedTaskId: id, openTaskId: id };
    }}
    onComplete={(id, status) => {
      tasks = tasks.map((task) =>
        task.id === id ? { ...task, status } : task,
      );
    }}
    onToggleDoneGroup={(collapsed) => {
      doneCollapsed = collapsed;
    }}
    onReorder={(action) => {
      lastReorder = action.accepted
        ? `Reordered ${action.taskId}`
        : `Rejected ${action.taskId}`;
      if (!action.accepted) return;
      const ids = [...listView.orderedTaskIds];
      const [moved] = ids.splice(action.fromIndex, 1);
      if (!moved) return;
      ids.splice(action.toIndex, 0, moved);
      const byId = new Map(tasks.map((task) => [task.id, task]));
      tasks = ids
        .map((id) => byId.get(id))
        .filter((task): task is TaskReference => Boolean(task));
    }}
  >
    {#if mode === "default" || mode === "collapse"}
      <TaskComposer
        onSubmit={({ title }) => {
          tasks = [
            {
              id: `task-${tasks.length + 1}`,
              title,
              status: "open",
              due: null,
              priority: "none",
              labels: [],
              assignee: null,
            },
            ...tasks,
          ];
        }}
      />
    {/if}
  </TaskList>
  {#if selection.selectedTaskId}
    <p>Selected {selection.selectedTaskId}</p>
  {/if}
  {#if lastReorder}
    <p>{lastReorder}</p>
  {/if}
  {#if doneCollapsed}
    <p>Done collapsed</p>
  {:else}
    <p>Done expanded</p>
  {/if}
</div>
