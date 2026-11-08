<script lang="ts">
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import Grid2X2Icon from "@lucide/svelte/icons/grid-2x2";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import * as Dialog from "@lapismd/design-core/shadcn/dialog";
  import { ScrollArea } from "@lapismd/design-core/shadcn/scroll-area";
  import type { KanbanColumnData, KanbanCardSnippets } from "./kanban-types.js";
  import KanbanCard from "./KanbanCard.svelte";

  let {
    column,
    cardSnippets = undefined,
    open = $bindable(false),
    selectedCardId = null,
    movesEnabled = true,
    onClose,
    onSelectCard,
    onOpenCard,
    onMoveCard,
  }: {
    /** Column presented full-screen, or null when closed. */
    /** Consumer-owned card presentation regions. */
    cardSnippets?: KanbanCardSnippets;
    column: KanbanColumnData | null;
    /** Dialog visibility. */
    open: boolean;
    /** Card id rendering the selection outline. */
    selectedCardId?: string | null;
    /** When false, cards cannot be lifted or moved. */
    movesEnabled?: boolean;
    /** Closes the dialog (Back to board). */
    onClose: () => void;
    /** Selects a card without opening it. */
    onSelectCard: (cardId: string) => void;
    /** Opens the card detail dialog. */
    onOpenCard: (cardId: string) => void;
    /** Moves a card one column in `direction`. */
    onMoveCard: (cardId: string, direction: -1 | 1) => void;
  } = $props();

  function handleOpenChange(nextOpen: boolean): void {
    open = nextOpen;
  }
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
  <Dialog.Content
    class="column-view-screen"
    dataUiComponent="kanban-column-view"
    showCloseButton={false}
  >
    {#if column}
      <div
        class="column-view-page"
        style={`--column-color: ${column.color}; --card-count: ${Math.min(
          column.cards.length,
          15,
        )}`}
        data-ui-component="kanban-column-view"
        data-ui-part="page"
      >
        <header class="column-view-header">
          <Button variant="ghost" class="column-view-back" onclick={onClose}>
            <ArrowLeftIcon />
            Back to board
            <kbd>ESC</kbd>
          </Button>

          <div class="column-view-title">
            <div class="column-pill">
              <span class="column-count">{column.cards.length}</span>
              <Dialog.Title class="column-title">{column.label}</Dialog.Title>
              <Grid2X2Icon class="column-chevron" />
            </div>
            <Dialog.Description class="column-view-description">
              Full-screen column view
            </Dialog.Description>
          </div>

          <div></div>
        </header>

        <ScrollArea class="column-view-scroll" orientation="vertical">
          <section
            class="column-view-grid"
            aria-label={`${column.label} cards`}
          >
            {#each column.cards as card (card.id)}
              <KanbanCard
                {card}
                columnId={column.id}
                {cardSnippets}
                selected={card.id === selectedCardId}
                canMoveLeft={movesEnabled && !column.locked}
                canMoveRight={movesEnabled && !column.locked}
                {movesEnabled}
                onSelect={() => onSelectCard(card.id)}
                onOpen={() => onOpenCard(card.id)}
                onMoveLeft={() => onMoveCard(card.id, -1)}
                onMoveRight={() => onMoveCard(card.id, 1)}
              />
            {/each}

            {#if column.cards.length === 0}
              <div class="column-view-empty">No cards in {column.label}</div>
            {/if}
          </section>
        </ScrollArea>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
