<script lang="ts">
  import { untrack } from "svelte";
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import PencilIcon from "@lucide/svelte/icons/pencil";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { ScrollArea } from "@stevejuma/ui/shadcn/scroll-area";
  import { Separator } from "@stevejuma/ui/shadcn/separator";
  import { Textarea } from "@stevejuma/ui/shadcn/textarea";
  import type {
    TaskListReference,
    TaskReference,
    TasksPropertyChangeHandler,
    TaskStatus,
  } from "../../lib/contracts.js";
  import { TaskProperties } from "../task-properties/index.js";
  import "../../lib/tasks-theme.css";

  type Props = {
    task: TaskReference;
    /** Lists the task could belong to, forwarded to TaskProperties. */
    lists?: readonly TaskListReference[];
    currentListId?: string | null;
    assigneeOptions?: readonly string[];
    labelOptions?: readonly string[];
    onBack?: () => void;
    onComplete?: (taskId: string, status: TaskStatus) => void;
    onTitleChange?: (taskId: string, title: string) => void;
    onPropertyChange?: TasksPropertyChangeHandler;
    onNoteChange?: (taskId: string, note: string) => void;
  };

  let {
    task,
    lists = [],
    currentListId = null,
    assigneeOptions,
    labelOptions,
    onBack,
    onComplete,
    onTitleChange,
    onPropertyChange,
    onNoteChange,
  }: Props = $props();

  let rootEl = $state<HTMLElement | null>(null);
  let headingEl = $state<HTMLElement | null>(null);
  let titleInputEl = $state<HTMLInputElement | null>(null);
  let editingTitle = $state(false);
  let titleDraft = $state(untrack(() => task.title));
  let noteDraft = $state(untrack(() => task.note ?? ""));
  let lastTaskId = untrack(() => task.id);

  const done = $derived(task.status === "done");
  const completeLabel = $derived(`Complete ${task.title}`);

  $effect(() => {
    if (task.id !== lastTaskId) {
      lastTaskId = task.id;
      titleDraft = task.title;
      noteDraft = task.note ?? "";
      editingTitle = false;
    }
  });

  $effect(() => {
    headingEl?.focus();
  });

  $effect(() => {
    const node = rootEl;
    if (!node) return;
    // Rebind when edit mode changes so Escape-while-editing does not call back.
    const titleEditing = editingTitle;
    function onRootKeydown(event: KeyboardEvent) {
      if (event.key !== "Escape" || titleEditing) return;
      onBack?.();
    }
    node.addEventListener("keydown", onRootKeydown);
    return () => node.removeEventListener("keydown", onRootKeydown);
  });

  $effect(() => {
    if (editingTitle) titleInputEl?.focus();
  });

  function toggleComplete() {
    onComplete?.(task.id, done ? "open" : "done");
  }

  function startEditTitle() {
    titleDraft = task.title;
    editingTitle = true;
  }

  function commitTitle() {
    const next = titleDraft.trim();
    editingTitle = false;
    if (!next || next === task.title) {
      titleDraft = task.title;
      return;
    }
    onTitleChange?.(task.id, next);
  }

  function cancelTitle() {
    titleDraft = task.title;
    editingTitle = false;
  }

  function onTitleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitTitle();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancelTitle();
    }
  }

  function commitNote() {
    const next = noteDraft;
    if (next === (task.note ?? "")) return;
    onNoteChange?.(task.id, next);
  }
</script>

<div
  bind:this={rootEl}
  class="tasks-theme tasks-task-detail"
  data-tasks-detail
  role="group"
  aria-label="Task detail"
>
  <header class="tasks-task-detail__header">
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Back to list"
      data-tasks-detail-back
      onclick={() => onBack?.()}
    >
      <ArrowLeftIcon aria-hidden="true" />
    </Button>

    <button
      type="button"
      class="tasks-task-detail__complete"
      role="checkbox"
      aria-checked={done}
      aria-label={completeLabel}
      data-tasks-detail-complete
      onclick={toggleComplete}
    >
      <span class="tasks-task-detail__complete-mark" aria-hidden="true"></span>
    </button>

    <div class="tasks-task-detail__title-row">
      {#if editingTitle}
        <input
          bind:this={titleInputEl}
          bind:value={titleDraft}
          class="tasks-task-detail__title-input"
          aria-label="Task title"
          data-tasks-detail-title-input
          onkeydown={onTitleKeydown}
          onblur={commitTitle}
        />
      {:else}
        <h2
          bind:this={headingEl}
          tabindex="-1"
          class="tasks-task-detail__title-heading"
          class:tasks-task-detail__title-heading--done={done}
          data-tasks-detail-heading
        >
          {task.title}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Edit title"
          data-tasks-detail-edit-title
          onclick={startEditTitle}
        >
          <PencilIcon aria-hidden="true" />
        </Button>
      {/if}
    </div>
  </header>

  <Separator />

  <ScrollArea class="tasks-task-detail__scroll">
    <section class="tasks-task-detail__properties" aria-label="Task properties">
      <TaskProperties
        {task}
        {lists}
        {currentListId}
        {assigneeOptions}
        {labelOptions}
        {onPropertyChange}
      />
    </section>

    <Separator />

    <section class="tasks-task-detail__note" aria-label="Task note">
      <span class="tasks-task-detail__note-label">Note</span>
      <Textarea
        value={noteDraft}
        aria-label="Task note"
        placeholder="Add a note"
        data-tasks-detail-note
        oninput={(event) => {
          noteDraft = event.currentTarget.value;
        }}
        onblur={commitNote}
      />
    </section>

    <Separator />

    <section class="tasks-task-detail__activity" aria-label="Activity">
      <h3 class="tasks-task-detail__activity-heading">Activity</h3>
      <p class="tasks-task-detail__activity-empty">
        Activity for this task will appear here.
      </p>
      <div
        class="tasks-task-detail__comment-placeholder"
        data-tasks-detail-comment-placeholder
      >
        <span>Comments are not available yet.</span>
      </div>
    </section>
  </ScrollArea>
</div>

<style>
  .tasks-task-detail {
    display: grid;
    grid-template-rows: auto auto 1fr;
    height: 100%;
    min-width: 0;
    background: var(--tasks-surface);
    color: var(--tasks-ink);
  }

  .tasks-task-detail__header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 0.75rem;
  }

  .tasks-task-detail__complete {
    display: inline-grid;
    place-items: center;
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
    border-radius: 0.25rem;
    border: 1.5px solid var(--tasks-divider);
    background: var(--tasks-surface-raised);
    color: var(--tasks-accent-ink);
    cursor: pointer;
  }

  .tasks-task-detail__complete[aria-checked="true"] {
    background: var(--tasks-accent);
    border-color: var(--tasks-accent);
  }

  .tasks-task-detail__complete[aria-checked="true"]
    .tasks-task-detail__complete-mark {
    width: 0.45rem;
    height: 0.7rem;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(40deg) translateY(-1px);
  }

  .tasks-task-detail__complete:focus-visible {
    outline: 2px solid var(--tasks-focus-ring);
    outline-offset: 2px;
  }

  .tasks-task-detail__title-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-width: 0;
    flex: 1;
  }

  .tasks-task-detail__title-heading {
    margin: 0;
    padding: 0.15rem 0.35rem;
    font-size: 1.05rem;
    font-weight: 650;
    line-height: 1.3;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: calc(var(--tasks-radius-control) - 2px);
  }

  .tasks-task-detail__title-heading--done {
    text-decoration: line-through;
    color: var(--tasks-muted-ink);
  }

  .tasks-task-detail__title-heading:focus-visible {
    outline: 2px solid var(--tasks-focus-ring);
    outline-offset: 2px;
  }

  .tasks-task-detail__title-input {
    flex: 1;
    min-width: 0;
    padding: 0.15rem 0.35rem;
    font-size: 1.05rem;
    font-weight: 650;
    line-height: 1.3;
    border: 1px solid var(--tasks-accent);
    border-radius: calc(var(--tasks-radius-control) - 2px);
    background: var(--tasks-surface-raised);
    color: var(--tasks-ink);
  }

  .tasks-task-detail__title-input:focus-visible {
    outline: 2px solid var(--tasks-focus-ring);
    outline-offset: 2px;
  }

  :global(.tasks-task-detail__scroll) {
    min-height: 0;
  }

  .tasks-task-detail__properties,
  .tasks-task-detail__note,
  .tasks-task-detail__activity {
    display: grid;
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .tasks-task-detail__note-label {
    font-size: 0.8rem;
    font-weight: 550;
    color: var(--tasks-muted-ink);
  }

  .tasks-task-detail__activity-heading {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 650;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--tasks-muted-ink);
  }

  .tasks-task-detail__activity-empty {
    margin: 0;
    font-size: 0.85rem;
    color: var(--tasks-muted-ink);
  }

  .tasks-task-detail__comment-placeholder {
    padding: 0.6rem 0.75rem;
    border: 1px dashed var(--tasks-divider);
    border-radius: var(--tasks-radius-control);
    color: var(--tasks-muted-ink);
    font-size: 0.8rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .tasks-task-detail__complete,
    .tasks-task-detail__title-heading {
      transition: none;
    }
  }
</style>
