<script lang="ts">
  import { tick, type Snippet } from "svelte";
  import CheckIcon from "@lucide/svelte/icons/check";
  import PinIcon from "@lucide/svelte/icons/pin";
  import PinOffIcon from "@lucide/svelte/icons/pin-off";
  import StarIcon from "@lucide/svelte/icons/star";
  import TagIcon from "@lucide/svelte/icons/tag";
  import { Badge } from "@lapismd/design-core/shadcn/badge";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import * as Dialog from "@lapismd/design-core/shadcn/dialog";
  import { Input } from "@lapismd/design-core/shadcn/input";
  import { formatKanbanDate } from "./kanban-format.js";
  import type {
    KanbanCardData,
    KanbanDetailBodyContext,
    KanbanDetailColumnOption,
  } from "./kanban-types.js";

  let {
    card,
    columnLabel = "",
    columnId = "",
    isCompleted = false,
    columns,
    open = $bindable(false),
    onClose,
    onMoveToColumn,
    onTogglePin,
    onPromoteGolden,
    onSaveTitle,
    onMarkDone,
    brandLabel = "Kanban",
    brand = undefined,
    body = undefined,
  }: {
    /** Card being presented, or null when nothing is selected. */
    card: KanbanCardData | null;
    /** Label rendered in the coloured board tab of the detail card. */
    columnLabel?: string;
    /** Column the card currently belongs to; disables its stage button. */
    columnId?: string;
    /** Whether the owning column is a completion lane. */
    isCompleted?: boolean;
    /** Stage navigation targets. */
    columns: KanbanDetailColumnOption[];
    /** Dialog visibility. */
    open: boolean;
    /** Closes the dialog (Back button). */
    onClose: () => void;
    /** Moves the card to the chosen stage column. */
    onMoveToColumn: (columnId: string) => void;
    /** Toggles the card's pinned state. */
    onTogglePin: () => void;
    /** Promotes the card to a golden ticket. */
    onPromoteGolden: () => void;
    /** Persists an edited title; may resolve to the card's replacement id. */
    onSaveTitle: (title: string) => Promise<string | null> | string | null;
    /** Marks the card done (moves it to the completion column). */
    onMarkDone: () => void;
    /** Label rendered beside the default four-square logo in the header. */
    brandLabel?: string;
    /** Replaces the default brand block in the header. */
    brand?: Snippet<[]>;
    /**
     * Consumer-owned body surface rendered under the title (legacy: task card
     * row and editable markdown preview). Receives the card plus the shared
     * body-editing state toggled by the Edit button and the `E` shortcut.
     */
    body?: Snippet<[context: KanbanDetailBodyContext]>;
  } = $props();

  const tags = $derived(card?.tags ?? []);
  const pinned = $derived(card?.pinned ?? false);
  const isGolden = $derived(card?.golden ?? false);
  const isNotNow = $derived(card?.stamp?.tone === "not-now");
  const stamp = $derived(card?.stamp ?? null);
  const closureMessage = $derived(card?.closureMessage ?? null);

  let bodyEditing = $state(false);
  let titleEditing = $state(false);
  let titleDraft = $state("");
  let titleSaving = $state(false);
  let titleInput = $state<HTMLInputElement | null>(null);
  let previousCardId = $state<string | null>(null);
  let detailRoot = $state<HTMLElement | null>(null);

  $effect(() => {
    const nextCardId = card?.id ?? null;
    if (previousCardId !== nextCardId) {
      previousCardId = nextCardId;
      bodyEditing = false;
    }

    if (!open) {
      bodyEditing = false;
    }
  });

  $effect(() => {
    if (!titleEditing) {
      titleDraft = card?.title ?? "";
    }
  });

  async function startTitleEdit(): Promise<void> {
    titleDraft = card?.title ?? "";
    titleEditing = true;
    await tick();
    titleInput?.focus();
    titleInput?.select();
  }

  async function saveTitle(): Promise<void> {
    const nextTitle = titleDraft.trim();
    if (!card || !nextTitle || titleSaving) {
      titleEditing = false;
      titleDraft = card?.title ?? "";
      return;
    }

    if (nextTitle === card.title) {
      titleEditing = false;
      return;
    }

    titleSaving = true;
    try {
      await onSaveTitle(nextTitle);
      titleEditing = false;
    } finally {
      titleSaving = false;
    }
  }

  function cancelTitleEdit(): void {
    titleEditing = false;
    titleDraft = card?.title ?? "";
  }

  async function handleTitleKeydown(event: KeyboardEvent): Promise<void> {
    if (event.key === "Enter") {
      event.preventDefault();
      await saveTitle();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelTitleEdit();
    }
  }

  function setBodyEditing(editing: boolean): void {
    bodyEditing = editing;
  }

  function handleDetailKeydown(event: KeyboardEvent): void {
    if (
      event.defaultPrevented ||
      !open ||
      !isKeyboardScopeActive(detailRoot, event)
    ) {
      return;
    }

    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    if (event.target instanceof HTMLElement) {
      const interactive = event.target.closest(
        "button, a, input, textarea, select, [contenteditable='true'], .cm-editor, .cm-content",
      );
      if (interactive) {
        return;
      }
    }

    if (event.key === "e" || event.key === "E") {
      event.preventDefault();
      bodyEditing = true;
    }
  }

  function isKeyboardScopeActive(
    root: HTMLElement | null,
    event: KeyboardEvent,
  ): boolean {
    if (!root || !root.isConnected || !isVisible(root)) {
      return false;
    }

    if (event.target instanceof Node && root.contains(event.target)) {
      return true;
    }

    return document.activeElement instanceof Node
      ? root.contains(document.activeElement)
      : false;
  }

  function isVisible(element: HTMLElement): boolean {
    if (typeof getComputedStyle !== "function") {
      return true;
    }

    const style = getComputedStyle(element);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      element.getClientRects().length > 0
    );
  }

  function handleOpenChange(nextOpen: boolean): void {
    open = nextOpen;
  }
</script>

<svelte:window onkeydown={handleDetailKeydown} />

<Dialog.Root {open} onOpenChange={handleOpenChange}>
  <Dialog.Content
    bind:ref={detailRoot}
    class="detail-screen"
    dataUiComponent="kanban-card-detail"
    showCloseButton={false}
  >
    {#if card}
      <div
        class="detail-page {isGolden ? 'is-golden' : ''}"
        style={`--card-color: ${card.color}`}
        data-ui-component="kanban-card-detail"
        data-ui-part="page"
      >
        <header class="detail-header">
          <Button variant="ghost" class="detail-back" onclick={onClose}>
            Back
            <kbd>ESC</kbd>
          </Button>

          {#if brand}
            {@render brand()}
          {:else}
            <div class="detail-brand" aria-label={brandLabel}>
              <span class="detail-logo" aria-hidden="true">
                <span></span><span></span><span></span><span></span>
              </span>
              <strong>{brandLabel}</strong>
            </div>
          {/if}

          <div></div>
        </header>

        <section class="detail-perma" aria-label="Card detail">
          <div class="detail-actions detail-actions-left">
            <Button
              variant="outline"
              size="icon"
              class="detail-action-btn"
              aria-label={isGolden
                ? "Already a golden ticket"
                : "Promote to golden ticket"}
              disabled={isGolden}
              onclick={onPromoteGolden}
            >
              <StarIcon />
            </Button>
          </div>

          <div class="detail-card-bg">
            <article class="detail-main-card">
              <header class="detail-card-header">
                <div class="card-board detail-board-label">
                  <span>{columnLabel}</span>
                </div>

                {#each tags as tag (tag)}
                  <Badge variant="outline" class="detail-tag">
                    <TagIcon />
                    {tag}
                  </Badge>
                {/each}
              </header>

              <div class="detail-card-body">
                <div class="detail-card-content">
                  <Dialog.Title class="sr-only">{card.title}</Dialog.Title>

                  {#if titleEditing}
                    <Input
                      bind:ref={titleInput}
                      bind:value={titleDraft}
                      class="detail-title-input"
                      aria-label="Card title"
                      disabled={titleSaving}
                      onkeydown={handleTitleKeydown}
                      onblur={() => {
                        void saveTitle();
                      }}
                    />
                  {:else}
                    <button
                      type="button"
                      class="detail-title detail-title-button"
                      aria-label={`Edit card title: ${card.title}`}
                      onclick={() => {
                        void startTitleEdit();
                      }}
                    >
                      {card.title}
                    </button>
                  {/if}

                  {#if body}
                    <div class="detail-body">
                      {@render body({
                        card,
                        editing: bodyEditing,
                        setEditing: setBodyEditing,
                      })}
                    </div>
                  {/if}

                  {#if card.progress}
                    <div class="detail-steps">
                      <strong
                        ><CheckIcon />
                        {card.progress.done}/{card.progress.total}</strong
                      >
                    </div>
                  {:else}
                    <div class="detail-steps">
                      <span class="add-step-row">
                        <span class="step-box"></span>
                        No steps
                      </span>
                    </div>
                  {/if}
                </div>

                <nav class="detail-stages" aria-label="Move card to column">
                  {#each columns as column (column.id)}
                    <button
                      type="button"
                      class:current-stage={column.id === columnId}
                      onclick={() => onMoveToColumn(column.id)}
                      disabled={column.id === columnId}
                    >
                      {column.label}
                    </button>
                  {/each}
                </nav>

                {#if isCompleted && stamp?.tone === "done" && stamp.date}
                  <div class="done-stamp">
                    <span>{stamp.label}</span>
                    <strong
                      >{formatKanbanDate(stamp.date, { year: true })}</strong
                    >
                    <small>{stamp.caption ?? "Completed"}</small>
                  </div>
                {:else if isNotNow && stamp?.date}
                  <div class="not-now-stamp">
                    <span>{stamp.label}</span>
                    <strong
                      >{formatKanbanDate(stamp.date, { year: true })}</strong
                    >
                    <small>{stamp.caption ?? "by System"}</small>
                  </div>
                {/if}
              </div>

              <footer class="detail-card-footer">
                <div class="detail-meta">
                  <span
                    >Added <strong
                      >{formatKanbanDate(card.createdAt, {
                        year: true,
                      })}</strong
                    ></span
                  >
                  <span
                    ><span aria-hidden="true">↻</span> Updated
                    <strong
                      >{formatKanbanDate(card.updatedAt, {
                        year: true,
                      })}</strong
                    ></span
                  >
                  <span>Status <strong>{card.statusText ?? "—"}</strong></span>
                  <span
                    >Priority <strong>{card.priorityText ?? "none"}</strong
                    ></span
                  >
                </div>
              </footer>
            </article>
          </div>

          <div class="detail-actions detail-actions-right">
            <Button
              variant="default"
              size="icon"
              class="detail-action-btn detail-dark"
              aria-label={pinned ? "Unpin this card" : "Pin this card"}
              onclick={onTogglePin}
            >
              {#if pinned}
                <PinOffIcon />
              {:else}
                <PinIcon />
              {/if}
            </Button>
          </div>

          <div class="detail-notch">
            <Button
              class="detail-primary"
              onclick={() => {
                bodyEditing = true;
              }}
            >
              Edit
            </Button>
            <Button
              class="detail-primary"
              disabled={isCompleted}
              onclick={onMarkDone}
            >
              Mark as Done <kbd>D</kbd>
            </Button>
          </div>

          {#if closureMessage && !isNotNow && !isCompleted}
            <p class="detail-closure">{closureMessage}</p>
          {/if}
        </section>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
