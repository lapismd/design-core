<script lang="ts">
  import PlusIcon from "@lucide/svelte/icons/plus";
  import XIcon from "@lucide/svelte/icons/x";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Field from "@stevejuma/ui/shadcn/field";
  import { Input } from "@stevejuma/ui/shadcn/input";
  import type { TaskComposeAction } from "../../lib/contracts.js";
  import "../../lib/tasks-theme.css";

  type Props = {
    /** Label for the idle trigger button. */
    idleLabel?: string;
    /** Draft title text; bindable so a story or host can inspect/seed it. */
    value?: string;
    /** Whether the composer is expanded to its active draft field. */
    active?: boolean;
    /** List the created task should be attached to, if any. */
    listId?: string | null;
    onSubmit?: (action: TaskComposeAction) => void;
    onCancel?: () => void;
  };

  let {
    idleLabel = "Add task",
    value = $bindable(""),
    active = $bindable(false),
    listId = null,
    onSubmit,
    onCancel,
  }: Props = $props();

  const fieldId = $props.id();
  let inputEl = $state<HTMLInputElement | null>(null);
  const canSubmit = $derived(value.trim().length > 0);

  $effect(() => {
    if (active) inputEl?.focus();
  });

  function activate() {
    value = "";
    active = true;
  }

  function commit() {
    const title = value.trim();
    if (!title) return;
    onSubmit?.({ title, listId });
    value = "";
    inputEl?.focus();
  }

  function cancel() {
    value = "";
    active = false;
    onCancel?.();
  }

  function onFieldKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      if (value.trim().length === 0) {
        cancel();
      }
    }
  }
</script>

<div
  class="tasks-theme tasks-task-composer"
  data-tasks-composer
  data-active={active}
>
  {#if !active}
    <Button
      type="button"
      variant="ghost"
      size="sm"
      class="tasks-task-composer__trigger"
      data-tasks-composer-trigger
      onclick={activate}
    >
      <PlusIcon aria-hidden="true" />
      {idleLabel}
    </Button>
  {:else}
    <Field.Field class="tasks-task-composer__field" orientation="horizontal">
      <Field.FieldLabel for={fieldId} class="sr-only"
        >Task title</Field.FieldLabel
      >
      <Input
        id={fieldId}
        bind:ref={inputEl}
        bind:value
        placeholder="Task title"
        aria-label="Task title"
        data-tasks-composer-input
        onkeydown={onFieldKeydown}
      />
      <Button
        type="button"
        size="sm"
        data-tasks-composer-submit
        disabled={!canSubmit}
        onclick={commit}
      >
        Add task
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Cancel new task"
        data-tasks-composer-cancel
        onclick={cancel}
      >
        <XIcon aria-hidden="true" />
      </Button>
    </Field.Field>
  {/if}
</div>

<style>
  .tasks-task-composer {
    display: flex;
    align-items: center;
    min-height: var(--tasks-task-row-height);
    padding: 0.15rem 0.35rem;
  }

  :global(.tasks-task-composer__trigger) {
    color: var(--tasks-muted-ink);
  }

  :global(.tasks-task-composer__field) {
    align-items: center;
    gap: 0.4rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .tasks-task-composer {
      transition: none;
    }
  }
</style>
