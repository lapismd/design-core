<script lang="ts">
  import { createTasksStoryFixture } from "../../lib/story-fixtures.js";
  import { TaskRow } from "../task-row/index.js";
  import TasksSwipeGesture from "./TasksSwipeGesture.svelte";

  let {
    mode = "row-swipe",
  }: {
    mode?: "row-swipe" | "pager-back";
  } = $props();

  const fixture = createTasksStoryFixture();
  const task = fixture.activeTask;

  let revealed = $state(false);
  let cancelled = $state(false);
  let pane = $state<"list" | "detail">("detail");
</script>

<div class="tasks-theme" style="padding: 1rem; max-width: 26rem">
  {#if mode === "row-swipe"}
    <TasksSwipeGesture
      kind="row-swipe"
      disabled={revealed}
      onReveal={() => {
        revealed = true;
      }}
      onCancel={() => {
        cancelled = true;
      }}
    >
      <TaskRow {task} swipeRevealed={revealed} />
    </TasksSwipeGesture>
    {#if revealed}
      <p>Trailing action revealed</p>
    {/if}
    {#if cancelled}
      <p>Swipe cancelled for scroll intent</p>
    {/if}
  {:else}
    <TasksSwipeGesture
      kind="pager-back"
      disabled={pane === "list"}
      onPagerBack={() => {
        pane = "list";
      }}
    >
      <div
        style="padding: 1rem; border: 1px solid var(--tasks-divider); border-radius: 12px;"
        data-testid="pager-back-surface"
      >
        {#if pane === "detail"}
          Task detail pane
        {:else}
          Task list pane
        {/if}
      </div>
    </TasksSwipeGesture>
    <p>Pane {pane}</p>
  {/if}
</div>
