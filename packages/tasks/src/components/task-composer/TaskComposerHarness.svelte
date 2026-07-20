<script lang="ts">
  import type { TaskComposeAction } from "../../lib/contracts.js";
  import TaskComposer from "./TaskComposer.svelte";

  let {
    idleLabel = "Add task",
    listId = null,
  }: {
    idleLabel?: string;
    listId?: string | null;
  } = $props();

  let submitted = $state<TaskComposeAction[]>([]);
  let cancelled = $state(false);

  function handleSubmit(action: TaskComposeAction) {
    submitted = [...submitted, action];
  }

  function handleCancel() {
    cancelled = true;
  }
</script>

<div class="tasks-theme" style="padding: 1rem; max-width: 28rem">
  <TaskComposer
    {idleLabel}
    {listId}
    onSubmit={handleSubmit}
    onCancel={handleCancel}
  />

  {#each submitted as action, index (index)}
    <p>Task added: {action.title}</p>
  {/each}
  {#if cancelled}
    <p>Composer cancelled</p>
  {/if}
</div>
