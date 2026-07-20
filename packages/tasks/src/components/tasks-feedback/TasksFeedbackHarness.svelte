<script lang="ts">
  import type { TasksFeedbackState } from "../../lib/contracts.js";
  import TasksFeedback from "./TasksFeedback.svelte";

  let {
    state: feedbackState,
    rowCount = 3,
  }: {
    state: TasksFeedbackState;
    rowCount?: number;
  } = $props();

  let retried = $state(false);
  let undone = $state(false);
</script>

<div class="tasks-theme" style="padding: 1rem; max-width: 28rem">
  <TasksFeedback
    state={feedbackState}
    {rowCount}
    onRetry={() => {
      retried = true;
    }}
    onUndo={() => {
      undone = true;
    }}
  />
  {#if retried}
    <p>Retry requested</p>
  {/if}
  {#if undone}
    <p>Undo requested</p>
  {/if}
</div>
