<script lang="ts">
  import { createDraggable } from "@dnd-kit/svelte";
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
  import CheckIcon from "@lucide/svelte/icons/check";
  import MessageCircleIcon from "@lucide/svelte/icons/message-circle";
  import PinIcon from "@lucide/svelte/icons/pin";
  import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
  import TagIcon from "@lucide/svelte/icons/tag";
  import ZapIcon from "@lucide/svelte/icons/zap";
  import { Badge } from "@lapismd/design-core/shadcn/badge";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import KanbanMetadata from "./KanbanMetadata.svelte";
  import KanbanHighlight from "./KanbanHighlight.svelte";
  import type { KanbanCardData, KanbanCardSnippets } from "./kanban-types.js";
  import { formatKanbanDate } from "./kanban-format.js";

  let {
    card,
    columnId = "",
    cardSnippets = undefined,
    selected = false,
    tabIndex = undefined,
    canMoveLeft = false,
    canMoveRight = false,
    movesEnabled = true,
    onSelect,
    onOpen,
    onMoveLeft,
    onMoveRight,
  }: {
    /** Card data driving the shared kanban card paint and meta cells. */
    card: KanbanCardData;
    /** Owning group identity supplied to presentation snippets. */
    columnId?: string;
    /** Consumer-owned card regions. */
    cardSnippets?: KanbanCardSnippets;
    /** Renders the selection outline and enables tab focus. */
    selected?: boolean;
    /** Override roving board focus for standalone/timeline cards. */
    tabIndex?: number;
    /** Enables the hover move-left pill. */
    canMoveLeft?: boolean;
    /** Enables the hover move-right pill. */
    canMoveRight?: boolean;
    /** When false, the card cannot be lifted into a drag. */
    movesEnabled?: boolean;
    /** Selection callback fired on focus and pointer down. */
    onSelect: () => void;
    /** Opens the card detail. */
    onOpen: () => void;
    /** Moves the card one column left. */
    onMoveLeft: () => void;
    /** Moves the card one column right. */
    onMoveRight: () => void;
  } = $props();

  const tags = $derived(card.tags ?? []);
  const showMiniStamp = $derived(
    card.stamp?.tone === "not-now" && !!card.stamp?.date,
  );

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onOpen();
  }

  const draggable = createDraggable({
    get id() {
      return `kanban-card:${card.id}`;
    },
    type: "kanban-card",
    get data() {
      return {
        type: "kanban-card",
        cardId: card.id,
      };
    },
  });

  $effect(() => {
    draggable.draggable.disabled = !movesEnabled;
  });
</script>

<div
  class="kanban-card-wrap"
  data-ui-component="kanban-card"
  data-ui-part="wrap"
>
  <div class="card-actions" data-ui-part="card-actions">
    <Button
      variant="ghost"
      size="icon"
      class="card-action-pill"
      aria-label={`Move ${card.title} left`}
      disabled={!canMoveLeft}
      onclick={onMoveLeft}
    >
      <ArrowLeftIcon />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      class="card-action-pill"
      aria-label={`Move ${card.title} right`}
      disabled={!canMoveRight}
      onclick={onMoveRight}
    >
      <ArrowRightIcon />
    </Button>
  </div>

  <div
    {@attach draggable.attach}
    class="kanban-card {selected ? 'is-selected' : ''} {card.golden
      ? 'is-golden'
      : ''}"
    style={`--card-color: ${card.color}`}
    role="button"
    tabindex={tabIndex ?? (selected ? 0 : -1)}
    data-ui-part="root"
    onclick={onOpen}
    onfocus={onSelect}
    onpointerdown={onSelect}
    onkeydown={handleKeydown}
  >
    <span class="sr-only">Open card: {card.title}.</span>
    <div class="kanban-card__frame">
      <div class="kanban-card__header" data-ui-part="card-header">
        <div class="card-board">
          <span>{card.tabLabel ?? card.title}</span>
        </div>

        {#if cardSnippets?.tags}
          {@render cardSnippets.tags({ card, columnId })}
        {:else if tags.length}
          <div class="kanban-card__tags">
            <TagIcon class="kanban-card__tag-icon" />
            <div class="kanban-card__tag-list">
              {#each tags as tag (tag)}
                <Badge variant="outline" class="kanban-card__tag">
                  {tag}
                </Badge>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      {#if card.pinned}
        <div class="pin-corner" aria-hidden="true" data-ui-part="pin-corner">
          <PinIcon />
        </div>
      {/if}

      <div class="kanban-card__content" data-ui-part="card-content">
        <div class="kanban-card__title-wrap">
          <div class="kanban-card__title">{card.title}</div>
        </div>

        {#if cardSnippets?.body}
          <div class="kanban-card__summary">
            {@render cardSnippets.body({ card, columnId })}
          </div>
        {:else if card.summary}
          <p class="kanban-card__summary" data-ui-part="summary">
            {card.summary}
          </p>
        {/if}

        {#if card.progress}
          <div class="kanban-card__progress">
            <CheckIcon />
            <span>{card.progress.done}/{card.progress.total}</span>
          </div>
        {/if}
      </div>

      <div class="kanban-card__footer" data-ui-part="card-footer">
        {#if cardSnippets?.metadata}
          {@render cardSnippets.metadata({ card, columnId })}
        {:else if card.metadata !== undefined}
          <KanbanMetadata fields={card.metadata} />
        {:else}
          <div class="card-meta">
            <span class="meta-cell"
              >Added <strong>{formatKanbanDate(card.createdAt)}</strong></span
            >
            <span class="meta-cell">
              <RefreshCwIcon />
              <strong>{formatKanbanDate(card.updatedAt)}</strong>
            </span>
            <span class="meta-cell"
              >{card.linkText ?? card.statusText ?? ""}</span
            >
            <span class="meta-cell">{card.priorityText ?? "No priority"}</span>
          </div>
        {/if}
        {#if card.counters}
          <div class="kanban-card__counters">
            <span>
              <ZapIcon />
              {card.counters.zap ?? 0}
            </span>
            <span>
              <MessageCircleIcon />
              {card.counters.comments ?? 0}
            </span>
          </div>
        {/if}
      </div>

      {#if cardSnippets?.badge}
        {@render cardSnippets.badge({ card, columnId })}
      {:else if card.badge}
        <KanbanHighlight badge={card.badge} />
      {:else if showMiniStamp && card.stamp}
        <div class="not-now-mini-stamp" data-ui-part="mini-stamp">
          <span>{card.stamp.label}</span>
          <strong>{formatKanbanDate(card.stamp.date)}</strong>
        </div>
      {/if}

      <span class="sr-only">
        {#if card.pinned}Pinned.{/if}
        {#if card.golden}Golden ticket.{/if}
      </span>
    </div>
  </div>
</div>
