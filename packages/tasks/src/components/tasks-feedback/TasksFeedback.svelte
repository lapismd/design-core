<script lang="ts">
  import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
  import InboxIcon from "@lucide/svelte/icons/inbox";
  import InfoIcon from "@lucide/svelte/icons/info";
  import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
  } from "@stevejuma/ui/shadcn/alert";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import {
    Empty,
    EmptyContent,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
  } from "@stevejuma/ui/shadcn/empty";
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
  import { Spinner } from "@stevejuma/ui/shadcn/spinner";
  import type {
    TasksFeedbackState,
    TasksRetryHandler,
    TasksUndoHandler,
  } from "../../lib/contracts.js";
  import "../../lib/tasks-theme.css";

  type Props = {
    state: TasksFeedbackState;
    /** Skeleton row count for the loading kind; matches task-row geometry. */
    rowCount?: number;
    onRetry?: TasksRetryHandler;
    onUndo?: TasksUndoHandler;
  };

  let { state, rowCount = 3, onRetry, onUndo }: Props = $props();

  const rows = $derived(Array.from({ length: rowCount }, (_, index) => index));
</script>

<div
  class="tasks-theme tasks-feedback"
  data-tasks-feedback
  data-kind={state.kind}
>
  {#if state.kind === "loading"}
    <div class="tasks-feedback__rows" role="status" aria-label={state.message}>
      {#each rows as row (row)}
        <div class="tasks-feedback__row">
          <Skeleton class="tasks-feedback__row-check" />
          <Skeleton class="tasks-feedback__row-title" />
        </div>
      {/each}
      <span class="sr-only">{state.message}</span>
    </div>
  {:else if state.kind === "empty"}
    <Empty class="tasks-feedback__empty" data-tasks-feedback-empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{state.message}</EmptyTitle>
      </EmptyHeader>
      {#if state.retryable}
        <EmptyContent>
          <Button type="button" size="sm" onclick={() => onRetry?.()}>
            Retry
          </Button>
        </EmptyContent>
      {/if}
    </Empty>
  {:else if state.kind === "preserving-error"}
    <Alert variant="destructive" class="tasks-feedback__alert">
      <AlertCircleIcon aria-hidden="true" />
      <AlertTitle>{state.message}</AlertTitle>
      <AlertDescription>
        The last known list is still shown while this is unresolved.
      </AlertDescription>
      {#if state.retryable}
        <AlertAction>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onclick={() => onRetry?.()}
          >
            Retry
          </Button>
        </AlertAction>
      {/if}
    </Alert>
  {:else if state.kind === "status"}
    <Alert class="tasks-feedback__alert" role="status">
      <Spinner aria-hidden="true" />
      <AlertTitle>{state.message}</AlertTitle>
      {#if state.retryable}
        <AlertAction>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onclick={() => onRetry?.()}
          >
            Retry
          </Button>
        </AlertAction>
      {/if}
    </Alert>
  {:else if state.kind === "undo"}
    <div class="tasks-feedback__undo" role="status" data-tasks-feedback-undo>
      <InfoIcon aria-hidden="true" class="tasks-feedback__undo-icon" />
      <span class="tasks-feedback__undo-message">{state.message}</span>
      {#if state.undoable}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onclick={() => onUndo?.()}
        >
          Undo
        </Button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .tasks-feedback {
    display: grid;
  }

  .tasks-feedback__rows {
    display: grid;
    gap: 0.4rem;
  }

  .tasks-feedback__row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-height: var(--tasks-task-row-height);
    padding: 0 0.35rem;
  }

  :global(.tasks-feedback__row-check) {
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 999px;
    flex-shrink: 0;
  }

  :global(.tasks-feedback__row-title) {
    height: 0.85rem;
    width: 60%;
    border-radius: var(--tasks-radius-control);
  }

  :global(.tasks-feedback__empty) {
    border-radius: var(--tasks-radius-control);
    background: var(--tasks-surface);
    color: var(--tasks-ink);
  }

  :global(.tasks-feedback__alert) {
    border-radius: var(--tasks-radius-control);
  }

  /* Keep destructive copy above WCAG AA on the alert surface (shadcn red on
     pure white is ~4.49:1). Darken description ink under the Tasks theme. */
  :global(
      .tasks-feedback__alert[data-variant="destructive"]
        [data-ui-part="alert-description"]
    ) {
    color: oklch(0.42 0.19 25);
  }

  .tasks-feedback__undo {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 0.85rem;
    border-radius: var(--tasks-radius-control);
    background: var(--tasks-surface-raised);
    color: var(--tasks-ink);
    box-shadow: 0 1px 2px oklch(0 0 0 / 0.08);
  }

  :global(.tasks-feedback__undo-icon) {
    flex-shrink: 0;
    color: var(--tasks-accent);
  }

  .tasks-feedback__undo-message {
    flex: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.tasks-feedback__row-check),
    :global(.tasks-feedback__row-title) {
      animation: none;
    }
  }
</style>
