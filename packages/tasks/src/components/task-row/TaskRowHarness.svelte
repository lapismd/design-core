<script lang="ts">
  import type { TaskReference, TaskStatus } from "../../lib/contracts.js";
  import TaskRow from "./TaskRow.svelte";

  type Mode =
    | "complete"
    | "select-open"
    | "double-click"
    | "keyboard"
    | "default";

  let {
    task,
    mode = "default",
    swipeRevealed = false,
    dragging = false,
  }: {
    task: TaskReference;
    mode?: Mode;
    swipeRevealed?: boolean;
    dragging?: boolean;
  } = $props();

  let completed = $state(false);
  let selected = $state(false);
  let open = $state(false);

  const currentTask = $derived({
    ...task,
    status: (completed ? "done" : "open") as TaskStatus,
  });
</script>

<div class="tasks-theme" style="padding: 1rem; max-width: 40rem">
  <TaskRow
    task={currentTask}
    {selected}
    {swipeRevealed}
    {dragging}
    onSelect={() => {
      selected = true;
    }}
    onOpen={() => {
      open = true;
    }}
    onComplete={(_id, next) => {
      completed = next === "done";
    }}
  />

  {#if mode === "complete" && completed}
    <p>Task completed</p>
  {/if}
  {#if (mode === "select-open" || mode === "double-click") && selected}
    <p>Task selected</p>
  {/if}
  {#if (mode === "select-open" || mode === "keyboard") && open}
    <p>Task detail open</p>
  {/if}
  {#if mode === "double-click" && open}
    <p>Task detail open</p>
  {/if}
</div>
