<script lang="ts">
  import { untrack } from "svelte";
  import type {
    TaskListReference,
    TaskPropertyMutation,
    TaskReference,
    TaskStatus,
  } from "../../lib/contracts.js";
  import TaskDetail from "./TaskDetail.svelte";

  let {
    task: initialTask,
    lists = [],
    currentListId: initialCurrentListId = null,
    open = true,
  }: {
    task: TaskReference;
    lists?: readonly TaskListReference[];
    currentListId?: string | null;
    open?: boolean;
  } = $props();

  let task = $state(untrack(() => initialTask));
  let currentListId = $state(untrack(() => initialCurrentListId));
  let detailOpen = $state(untrack(() => open));
  let lastTitle = $state("");
  let lastNote = $state("");
  let lastProperty = $state<TaskPropertyMutation | null>(null);
  let backCount = $state(0);

  function handleComplete(_taskId: string, status: TaskStatus) {
    task = { ...task, status };
  }

  function handleTitleChange(_taskId: string, title: string) {
    task = { ...task, title };
    lastTitle = title;
  }

  function handleNoteChange(_taskId: string, note: string) {
    task = { ...task, note };
    lastNote = note;
  }

  function handlePropertyChange(
    _taskId: string,
    mutation: TaskPropertyMutation,
  ) {
    lastProperty = mutation;
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

  function handleBack() {
    backCount += 1;
    detailOpen = false;
  }
</script>

<div class="tasks-theme" style="padding: 1rem; max-width: 30rem">
  {#if detailOpen}
    <div
      style="border: 1px solid var(--tasks-divider); border-radius: 12px; height: 26rem; overflow: hidden"
    >
      <TaskDetail
        {task}
        {lists}
        {currentListId}
        onBack={handleBack}
        onComplete={handleComplete}
        onTitleChange={handleTitleChange}
        onPropertyChange={handlePropertyChange}
        onNoteChange={handleNoteChange}
      />
    </div>
  {:else}
    <p>Returned to task list</p>
  {/if}
  {#if lastTitle}
    <p>Title changed: {lastTitle}</p>
  {/if}
  {#if lastNote}
    <p>Note changed: {lastNote}</p>
  {/if}
  {#if lastProperty}
    <p>Property changed: {lastProperty.key}</p>
  {/if}
  {#if backCount > 0}
    <p>Back requested</p>
  {/if}
</div>
