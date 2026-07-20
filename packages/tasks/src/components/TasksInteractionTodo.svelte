<script lang="ts">
  import { tick } from "svelte";
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import "../lib/tasks-theme.css";

  export type TasksInteractionScenario =
    | "task-row"
    | "reorder"
    | "swipe-row"
    | "detail-return"
    | "list-navigation"
    | "composer"
    | "properties"
    | "filters"
    | "feedback";

  let { scenario }: { scenario: TasksInteractionScenario } = $props();

  let completed = $state(false);
  let selected = $state(false);
  let detailOpen = $state(false);
  let swipeRevealed = $state(false);
  let favorite = $state(false);
  let menuOpen = $state(false);
  let retried = $state(false);
  let draft = $state("");
  let createdTask = $state("");
  let priority = $state("Medium");
  let startX = 0;
  let startY = 0;
  let detailHeading: HTMLHeadingElement | undefined = $state();

  const title = "Review the launch brief";

  function selectRow() {
    selected = true;
  }

  async function openDetail() {
    detailOpen = true;
    await tick();
    detailHeading?.focus();
  }

  function handleRowKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      selectRow();
    }
  }

  function startPointer(event: PointerEvent) {
    startX = event.clientX;
    startY = event.clientY;
  }

  function revealSwipe(event: PointerEvent) {
    if (event.clientX - startX < -32) swipeRevealed = true;
  }

  function reorder(event: PointerEvent) {
    if (event.clientY - startY > 16) selected = true;
  }

  function returnFromDetail(event: PointerEvent) {
    if (event.clientX - startX > 32) detailOpen = false;
  }

  function submitDraft() {
    if (!draft.trim()) return;
    createdTask = draft.trim();
    draft = "";
  }
</script>

<section
  class="tasks-theme tasks-interaction-todo"
  data-tasks-scenario={scenario}
>
  <header>
    <div>
      <p>Executable interaction contract</p>
      <h2>TODO: replace this harness with the production component</h2>
    </div>
    <Badge variant="outline">TODO</Badge>
  </header>

  {#if scenario === "task-row"}
    <div class="tasks-interaction-todo__row">
      <button
        type="button"
        role="checkbox"
        aria-checked={completed}
        aria-label={`Complete ${title}`}
        onclick={() => (completed = !completed)}
      >
        {completed ? "Done" : "Mark done"}
      </button>
      <button
        type="button"
        aria-pressed={selected}
        onclick={selectRow}
        ondblclick={selectRow}
        onkeydown={handleRowKeydown}
      >
        {title}
      </button>
      {#if selected}
        <Button size="sm" onclick={openDetail}>Details</Button>
      {/if}
    </div>
    <output aria-live="polite">
      {detailOpen
        ? "Task detail open"
        : completed
          ? "Task completed"
          : selected
            ? "Task selected"
            : "Task not selected"}
    </output>
  {:else if scenario === "reorder"}
    <ol aria-label="Task order">
      {#if selected}
        <li>Plan team kickoff</li>
        <li>{title}</li>
      {:else}
        <li>{title}</li>
        <li>Plan team kickoff</li>
      {/if}
    </ol>
    <button
      type="button"
      aria-label={`Drag ${title}`}
      onpointerdown={startPointer}
      onpointerup={reorder}
    >
      Drag {title}
    </button>
    <output aria-live="polite">
      {selected ? "Task reordered" : "Task order unchanged"}
    </output>
  {:else if scenario === "swipe-row"}
    <div
      class:tasks-interaction-todo__swipe-revealed={swipeRevealed}
      class="tasks-interaction-todo__swipe-row"
      role="button"
      tabindex="0"
      aria-label={`Swipe ${title} left to reveal actions`}
      onpointerdown={startPointer}
      onpointerup={revealSwipe}
    >
      {title}
    </div>
    {#if swipeRevealed}
      <Button size="sm" onclick={() => (completed = true)}>Complete task</Button
      >
    {/if}
    <output aria-live="polite">
      {completed
        ? "Task completed"
        : swipeRevealed
          ? "Trailing action revealed"
          : "Trailing action hidden"}
    </output>
  {:else if scenario === "detail-return"}
    {#if detailOpen}
      <div
        class="tasks-interaction-todo__detail"
        role="dialog"
        aria-labelledby="todo-detail-heading"
        tabindex="-1"
        onpointerdown={startPointer}
        onpointerup={returnFromDetail}
        onkeydown={(event) => {
          if (event.key === "Escape") detailOpen = false;
        }}
      >
        <h3 id="todo-detail-heading" bind:this={detailHeading} tabindex="-1">
          Task detail
        </h3>
        <Button size="sm" onclick={() => (detailOpen = false)}
          >Back to list</Button
        >
      </div>
    {:else}
      <Button onclick={openDetail}>Open task detail</Button>
    {/if}
    <output aria-live="polite">
      {detailOpen ? "Task detail open" : "Returned to task list"}
    </output>
  {:else if scenario === "list-navigation"}
    <div class="tasks-interaction-todo__row">
      <button type="button" onclick={() => (detailOpen = true)}
        >Design notes</button
      >
      <button
        type="button"
        aria-pressed={favorite}
        aria-label="Favourite Design notes"
        onclick={() => (favorite = !favorite)}
      >
        {favorite ? "Favourited" : "Favourite"}
      </button>
    </div>
    <output aria-live="polite">
      {detailOpen
        ? "List detail open"
        : favorite
          ? "List favourite changed"
          : "List index"}
    </output>
  {:else if scenario === "composer"}
    <label>
      Task title
      <input bind:value={draft} placeholder="Draft a task" />
    </label>
    <Button onclick={submitDraft}>Add task</Button>
    <output aria-live="polite">
      {createdTask ? `Task added: ${createdTask}` : "No task created"}
    </output>
  {:else if scenario === "properties"}
    <label>
      Priority
      <select bind:value={priority} aria-label="Priority">
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>
    </label>
    <output aria-live="polite">Priority set to {priority}</output>
  {:else if scenario === "filters"}
    <Button onclick={() => (menuOpen = !menuOpen)}>Filter tasks</Button>
    {#if menuOpen}
      <button type="button" onclick={() => (menuOpen = false)}
        >Assigned to me</button
      >
    {/if}
    <output aria-live="polite">
      {menuOpen ? "Filter menu open" : "Filter menu closed"}
    </output>
  {:else if scenario === "feedback"}
    <Button onclick={() => (retried = true)}>Retry</Button>
    <output aria-live="polite"
      >{retried ? "Retry requested" : "Retry available"}</output
    >
  {/if}
</section>

<style>
  .tasks-interaction-todo {
    display: grid;
    gap: 1rem;
    min-height: 100%;
    padding: clamp(1rem, 4vw, 3rem);
    color: var(--tasks-ink);
  }

  header,
  .tasks-interaction-todo__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  header p,
  h2,
  h3,
  output {
    margin: 0;
  }

  header p,
  output {
    color: var(--tasks-muted-ink);
    font-size: 0.875rem;
  }

  h2 {
    font-size: 1.125rem;
  }

  button,
  input,
  select {
    border: 1px solid var(--tasks-divider);
    border-radius: var(--tasks-radius-control);
    background: var(--tasks-surface);
    color: inherit;
    padding: 0.5rem 0.75rem;
  }

  ol,
  label {
    display: grid;
    gap: 0.5rem;
    margin: 0;
  }

  .tasks-interaction-todo__swipe-row,
  .tasks-interaction-todo__detail {
    width: min(100%, 32rem);
    border: 1px solid var(--tasks-divider);
    border-radius: var(--tasks-radius-control);
    background: var(--tasks-surface);
    padding: 1rem;
    transition: transform 220ms ease;
  }

  .tasks-interaction-todo__swipe-revealed {
    transform: translateX(-3rem);
  }
</style>
