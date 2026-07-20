<script lang="ts">
  import type {
    TaskListReference,
    TaskPropertyMutation,
    TaskReference,
  } from "../../lib/contracts.js";
  import TaskProperties from "./TaskProperties.svelte";

  let {
    task: initialTask,
    lists = [],
    currentListId: initialCurrentListId = null,
  }: {
    task: TaskReference;
    lists?: readonly TaskListReference[];
    currentListId?: string | null;
  } = $props();

  let task = $state(initialTask);
  let currentListId = $state(initialCurrentListId);
  let lastChange = $state<TaskPropertyMutation | null>(null);

  function handlePropertyChange(
    _taskId: string,
    mutation: TaskPropertyMutation,
  ) {
    lastChange = mutation;
    if (mutation.key === "due") {
      task = { ...task, due: mutation.value };
    } else if (mutation.key === "assignee") {
      task = { ...task, assignee: mutation.value };
    } else if (mutation.key === "priority") {
      task = { ...task, priority: mutation.value };
    } else if (mutation.key === "labels") {
      task = { ...task, labels: mutation.value };
    } else if (mutation.key === "list") {
      currentListId = mutation.value;
    }
  }
</script>

<div class="tasks-theme" style="padding: 1rem; max-width: 26rem">
  <TaskProperties
    {task}
    {lists}
    {currentListId}
    onPropertyChange={handlePropertyChange}
  />
  {#if lastChange}
    <p>Property changed: {lastChange.key}</p>
  {/if}
</div>
