<script module lang="ts">
  /**
   * Column colour swatches offered by the edit popover. Same hues as the
   * legacy Fizzy palette, darkened to the 700-level so white card-tab and
   * count text keeps the WCAG AA 4.5:1 contrast ratio.
   */
  export const KANBAN_COLUMN_COLOR_SWATCHES = [
    "#1d4ed8",
    "#64748b",
    "#a16207",
    "#b45309",
    "#4d7c0f",
    "#0e7490",
    "#6d28d9",
    "#7e22ce",
    "#a21caf",
  ];
</script>

<script lang="ts">
  import { createDroppable } from "@dnd-kit/svelte";
  import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
  import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import Grid2X2Icon from "@lucide/svelte/icons/grid-2x2";
  import PaletteIcon from "@lucide/svelte/icons/palette";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Input } from "@lapismd/design-core/shadcn/input";
  import * as Popover from "@lapismd/design-core/shadcn/popover";
  import { ScrollArea } from "@lapismd/design-core/shadcn/scroll-area";
  import type { KanbanColumnData, KanbanColumnMeta } from "./kanban-types.js";
  import KanbanCard from "./KanbanCard.svelte";

  let {
    column,
    expanded = true,
    selectedCardId = null,
    selectedColumn = false,
    draggedCardId = null,
    movesEnabled = true,
    onToggle,
    onMoveCard,
    onSelectCard,
    onOpenCard,
    onOpenColumnView,
    canMoveColumnLeft = false,
    canMoveColumnRight = false,
    onMoveColumnLeft,
    onMoveColumnRight,
    onEditColumn,
  }: {
    /** Column data driving header, collapse and card rendering. */
    column: KanbanColumnData;
    /** Whether the lane shows its header and card stack. */
    expanded?: boolean;
    /** Currently selected card id, driving card selection outlines. */
    selectedCardId?: string | null;
    /** Whether this column owns the selection ring. */
    selectedColumn?: boolean;
    /** Card id currently being dragged, if any. */
    draggedCardId?: string | null;
    /** When false, the column rejects drops and its cards cannot be lifted or moved. */
    movesEnabled?: boolean;
    /** Expands or collapses the column (disabled for locked columns). */
    onToggle: () => void;
    /** Moves a card one column in `direction`. */
    onMoveCard: (cardId: string, direction: -1 | 1) => void;
    /** Selects a card without opening it. */
    onSelectCard: (cardId: string) => void;
    /** Opens the card detail dialog. */
    onOpenCard: (cardId: string) => void;
    /** Opens the full-screen column view. */
    onOpenColumnView: () => void;
    /** Enables the Move Left column-menu action. */
    canMoveColumnLeft?: boolean;
    /** Enables the Move Right column-menu action. */
    canMoveColumnRight?: boolean;
    /** Reorders this column one slot left. */
    onMoveColumnLeft: () => void;
    /** Reorders this column one slot right. */
    onMoveColumnRight: () => void;
    /** Persists title/colour edits from the column popover. */
    onEditColumn: (meta: KanbanColumnMeta) => void;
  } = $props();

  const count = $derived(column.cards.length);
  let menuOpen = $state(false);
  let editingColumn = $state(false);
  let titleDraft = $state("");
  let colorDraft = $state("");

  const droppable = createDroppable({
    get id() {
      return `kanban-column:${column.id}`;
    },
    accept: "kanban-card",
    get data() {
      return {
        type: "kanban-column",
        columnId: column.id,
      };
    },
  });

  $effect(() => {
    droppable.droppable.disabled = !movesEnabled;
  });

  $effect(() => {
    if (!menuOpen) {
      editingColumn = false;
      titleDraft = column.label;
      colorDraft = column.color;
    }
  });

  function columnIndex(cardId: string): number {
    return column.cards.findIndex((candidate) => candidate.id === cardId);
  }

  function openEditPopup(): void {
    titleDraft = column.label;
    colorDraft = column.color;
    editingColumn = true;
    menuOpen = true;
  }

  function saveColumnChanges(): void {
    onEditColumn({
      title: titleDraft,
      color: colorDraft,
    });
    menuOpen = false;
  }

  function handleMenuOpenChange(nextOpen: boolean): void {
    menuOpen = nextOpen;
  }
</script>

<section
  {@attach droppable.attach}
  class="kanban-column {expanded
    ? 'is-expanded'
    : 'is-collapsed'} {selectedColumn
    ? 'is-selected'
    : ''} {droppable.isDropTarget ? 'is-drop-target' : ''}"
  style={`--column-color: ${column.color}; --card-count: ${Math.min(count, 15)}`}
  aria-labelledby={`${column.id}-title`}
  data-ui-component="kanban-column"
  data-ui-part="root"
>
  <div class="column-shell">
    {#if expanded}
      <header class="column-header" data-ui-part="column-header">
        <Popover.Root open={menuOpen} onOpenChange={handleMenuOpenChange}>
          <Popover.Trigger>
            {#snippet child({ props }: { props: Record<string, unknown> })}
              <Button
                {...props}
                variant="ghost"
                size="icon"
                class="column-options-button"
                aria-label={`Column options for ${column.label}`}
              >
                <EllipsisIcon />
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content align="start" class="column-popover" side="bottom">
            {#if editingColumn}
              <div class="column-popover__form">
                <div class="column-popover__heading">
                  <div class="column-popover__title">Edit column</div>
                  <div class="column-popover__copy">
                    Change the lane title and color.
                  </div>
                </div>

                <div class="column-popover__field">
                  <label
                    class="column-popover__label"
                    for={`${column.id}-title-input`}
                  >
                    Name
                  </label>
                  <Input
                    id={`${column.id}-title-input`}
                    bind:value={titleDraft}
                  />
                </div>

                <div class="column-popover__field">
                  <div class="column-popover__label">Color</div>
                  <div class="column-swatch-grid">
                    {#each KANBAN_COLUMN_COLOR_SWATCHES as swatch (swatch)}
                      <button
                        type="button"
                        class="kanban-column-swatch {colorDraft === swatch
                          ? 'is-selected'
                          : ''}"
                        style={`--kanban-swatch-color: ${swatch}`}
                        aria-label={`Choose column color ${swatch}`}
                        onclick={() => {
                          colorDraft = swatch;
                        }}
                      ></button>
                    {/each}
                  </div>
                </div>

                <div class="column-popover__actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onclick={() => {
                      editingColumn = false;
                    }}
                  >
                    Back
                  </Button>
                  <Button size="sm" onclick={saveColumnChanges}>Save</Button>
                </div>
              </div>
            {:else}
              <div class="column-menu" role="menu" aria-label="Column actions">
                <Button
                  variant="ghost"
                  class="column-menu-item"
                  role="menuitem"
                  disabled={!canMoveColumnLeft}
                  onclick={() => {
                    onMoveColumnLeft();
                    menuOpen = false;
                  }}
                >
                  <ArrowLeftIcon />
                  <span>Move Left</span>
                </Button>
                <Button
                  variant="ghost"
                  class="column-menu-item"
                  role="menuitem"
                  disabled={!canMoveColumnRight}
                  onclick={() => {
                    onMoveColumnRight();
                    menuOpen = false;
                  }}
                >
                  <ArrowRightIcon />
                  <span>Move Right</span>
                </Button>
                <Button
                  variant="ghost"
                  class="column-menu-item"
                  role="menuitem"
                  onclick={openEditPopup}
                >
                  <PaletteIcon />
                  <span>Edit Column</span>
                </Button>
              </div>
            {/if}
          </Popover.Content>
        </Popover.Root>

        <Button
          variant="ghost"
          class="column-pill"
          aria-label={column.locked
            ? `${count} ${column.label} cards, locked column`
            : `Collapse ${count} ${column.label}`}
          aria-expanded="true"
          aria-controls={`${column.id}-cards`}
          disabled={column.locked}
          onclick={onToggle}
        >
          <span class="column-count" aria-hidden="true">{count}</span>
          <h2 id={`${column.id}-title`} class="column-title">
            {column.label}
          </h2>
          <ChevronDownIcon class="column-chevron" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          class="column-maximize"
          aria-label={`Maximize ${column.label} column`}
          onclick={onOpenColumnView}
        >
          <Grid2X2Icon />
        </Button>
      </header>

      <div id={`${column.id}-cards`} class="column-stack">
        <ScrollArea class="column-stack-scroll" orientation="vertical">
          <div class="column-stack-inner">
            {#each column.cards as card (card.id)}
              <KanbanCard
                {card}
                selected={card.id === selectedCardId}
                canMoveLeft={movesEnabled &&
                  !column.locked &&
                  columnIndex(card.id) >= 0}
                canMoveRight={movesEnabled &&
                  !column.locked &&
                  columnIndex(card.id) >= 0}
                {movesEnabled}
                onSelect={() => onSelectCard(card.id)}
                onOpen={() => onOpenCard(card.id)}
                onMoveLeft={() => onMoveCard(card.id, -1)}
                onMoveRight={() => onMoveCard(card.id, 1)}
              />
            {/each}

            {#if !column.cards.length}
              <div class="column-no-cards">No cards</div>
            {/if}
          </div>
        </ScrollArea>
      </div>
    {:else}
      <Button
        variant="ghost"
        class="collapsed-column-button"
        aria-label={`Expand ${count} ${column.label}`}
        aria-expanded="false"
        aria-controls={`${column.id}-cards`}
        onclick={onToggle}
      >
        <span class="collapsed-progress" aria-hidden="true"></span>
        <span class="collapsed-count" aria-hidden="true">{count}</span>
        <span id={`${column.id}-title`} class="collapsed-title"
          >{column.label}</span
        >
      </Button>
    {/if}
  </div>
</section>
