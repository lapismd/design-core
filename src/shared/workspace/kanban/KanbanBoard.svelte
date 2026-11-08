<script lang="ts">
  import { DragDropProvider, DragOverlay } from "@dnd-kit/svelte";
  import type { DragEndEvent, DragStartEvent } from "@dnd-kit/dom";
  import { onMount, untrack, type Snippet } from "svelte";
  import { ScrollArea } from "@lapismd/design-core/shadcn/scroll-area";
  import type {
    KanbanCardData,
    KanbanCardSnippets,
    KanbanColumnData,
    KanbanColumnMeta,
    KanbanDetailBodyContext,
  } from "./kanban-types.js";
  import { resolveKanbanAnchor } from "./kanban-presentation.js";
  import KanbanColumn from "./KanbanColumn.svelte";
  import KanbanCardDetail from "./KanbanCardDetail.svelte";
  import KanbanColumnView from "./KanbanColumnView.svelte";
  import "./KanbanBoard.css";

  let {
    columns,
    anchorColumnId = undefined,
    cardSnippets = undefined,
    columnActions = undefined,
    beforeDetailClose = undefined,
    onMoveCardToColumn,
    onReorderColumns,
    onEditColumn,
    onTogglePin = undefined,
    onPromoteGolden = undefined,
    onSaveTitle = undefined,
    onCardOpen = undefined,
    movesEnabled = true,
    onBoardMount = undefined,
    ariaLabel = "Kanban board. Use arrow keys to navigate, Enter to open a card, Shift+arrow to move a card.",
    emptyTitle = "No cards match this board",
    emptyDescription = "Change the active filters to surface cards on this board.",
    brandLabel = "Kanban",
    brand = undefined,
    detailBody = undefined,
  }: {
    /** Ordered board columns; consumers derive them from their own data. */
    columns: KanbanColumnData[];
    /** Undefined preserves legacy anchoring; null disables it. */
    anchorColumnId?: string | null;
    /** Consumer-owned card presentation shared across board surfaces. */
    cardSnippets?: KanbanCardSnippets;
    /** Consumer-owned per-column controls. */
    columnActions?: Snippet<[column: KanbanColumnData]>;
    /** Return false to retain a detail whose source could not be saved. */
    beforeDetailClose?: () => boolean | Promise<boolean>;
    /** Persists a card move (drag-drop, move pills, stage nav, or keyboard). */
    onMoveCardToColumn: (
      cardId: string,
      columnId: string,
    ) => void | Promise<void>;
    /** Persists a new order for the reorderable (non-fixed) column ids. */
    onReorderColumns: (orderedColumnIds: string[]) => void;
    /** Persists column title/colour edits from the column popover. */
    onEditColumn: (columnId: string, meta: KanbanColumnMeta) => void;
    /** Toggles a card's pinned state. */
    onTogglePin?: (cardId: string) => void | Promise<void>;
    /** Promotes a card to a golden ticket. */
    onPromoteGolden?: (cardId: string) => void | Promise<void>;
    /** Persists an edited title; may resolve to the card's replacement id. */
    onSaveTitle?: (
      cardId: string,
      title: string,
    ) => Promise<string | null> | string | null;
    /**
     * Card activation override. When provided, card clicks, the board-level
     * Enter fallback, pinned-card clicks and column-view opens invoke this
     * callback instead of opening the built-in detail dialog.
     */
    onCardOpen?: (cardId: string, columnId: string) => void;
    /**
     * When false, drag & drop lifting, drop targets, move pills and the
     * Shift+arrow move shortcut are disabled; the board stays navigable and
     * read-only (for example when the grouped property is not writable).
     */
    movesEnabled?: boolean;
    /** Invoked once when the board mounts (legacy: entropy application). */
    onBoardMount?: () => void | Promise<void>;
    /** Accessible name for the board group. */
    ariaLabel?: string;
    /** Empty-board title. */
    emptyTitle?: string;
    /** Empty-board copy. */
    emptyDescription?: string;
    /** Label beside the default four-square logo in the detail header. */
    brandLabel?: string;
    /** Replaces the detail dialog's default brand block. */
    brand?: Snippet<[]>;
    /** Consumer-owned body surface inside the detail dialog. */
    detailBody?: Snippet<[context: KanbanDetailBodyContext]>;
  } = $props();

  let expandedColumnIds = $state<string[]>([]);
  let selectedCardId = $state<string | null>(null);
  let selectedColumnId = $state<string | null>(null);
  let detailOpen = $state(false);
  let columnViewId = $state<string | null>(null);
  let columnViewOpen = $state(false);
  let draggedCardId = $state<string | null>(null);
  let pinsExpanded = $state(false);
  let boardInitialized = $state(false);
  let boardRoot = $state<HTMLElement | null>(null);

  onMount(() => {
    if (onBoardMount) {
      void onBoardMount();
    }
  });

  function getPrimaryColumnId(): string | null {
    return resolveKanbanAnchor(columns, anchorColumnId);
  }

  const pinnedCards = $derived.by(() => {
    const cards: Array<{ column: KanbanColumnData; card: KanbanCardData }> = [];
    for (const column of columns) {
      for (const card of column.cards) {
        if (card.pinned) {
          cards.push({ column, card });
        }
      }
    }
    return cards.slice(0, 6);
  });

  const selectedContext = $derived.by(() => {
    if (!selectedCardId) return null;
    for (const column of columns) {
      const card = column.cards.find(
        (candidate) => candidate.id === selectedCardId,
      );
      if (card) return { column, card };
    }
    return null;
  });

  const columnViewContext = $derived(
    columns.find((column) => column.id === columnViewId) ?? null,
  );

  const draggedCard = $derived.by(() => {
    if (!draggedCardId) return null;
    for (const column of columns) {
      const card = column.cards.find(
        (candidate) => candidate.id === draggedCardId,
      );
      if (card) {
        return { card, columnId: column.id };
      }
    }
    return null;
  });

  $effect(() => {
    if (columns.length === 0 || boardInitialized) return;

    const firstActive = columns.find(
      (column) =>
        column.id !== getPrimaryColumnId() &&
        !column.excludeFromAutoExpand &&
        column.cards.length > 0,
    );

    untrack(() => {
      const primaryColumnId = getPrimaryColumnId();
      expandedColumnIds = [
        ...(primaryColumnId ? [primaryColumnId] : []),
        ...(firstActive ? [firstActive.id] : []),
      ].filter((value, index, values) => values.indexOf(value) === index);
      selectedColumnId = primaryColumnId;
      const primaryColumn = columns.find(
        (column) => column.id === primaryColumnId,
      );
      selectedCardId = primaryColumn?.cards[0]?.id ?? null;
      boardInitialized = true;
    });
  });

  $effect(() => {
    const anchor = getPrimaryColumnId();
    const ids = columns.map((column) => column.id);
    untrack(() => {
      const next = expandedColumnIds.filter((id) => ids.includes(id));
      if (anchor && !next.includes(anchor)) next.unshift(anchor);
      if (next.join("\0") !== expandedColumnIds.join("\0"))
        expandedColumnIds = next;
    });
  });

  function isExpanded(columnId: string): boolean {
    return expandedColumnIds.includes(columnId);
  }

  function toggleColumn(columnId: string): void {
    const column = columns.find((candidate) => candidate.id === columnId);
    if (!column || column.locked || columnId === getPrimaryColumnId()) return;

    const primaryColumnId = getPrimaryColumnId();

    expandedColumnIds = isExpanded(columnId)
      ? primaryColumnId
        ? [primaryColumnId]
        : []
      : [primaryColumnId, columnId].filter(
          (value, index, values): value is string =>
            !!value && values.indexOf(value) === index,
        );

    selectedColumnId = columnId;
    selectedCardId = column.cards[0]?.id ?? null;
  }

  function collapseToBoardView(): void {
    const primaryColumnId = getPrimaryColumnId();
    expandedColumnIds = primaryColumnId ? [primaryColumnId] : [];
    selectedColumnId = primaryColumnId;
    const primaryColumn = columns.find(
      (column) => column.id === primaryColumnId,
    );
    selectedCardId = primaryColumn?.cards[0]?.id ?? null;
    pinsExpanded = false;
  }

  function selectCard(columnId: string, cardId: string): void {
    selectedColumnId = columnId;
    selectedCardId = cardId;
  }

  function selectColumn(columnId: string, preferredCardIndex = 0): void {
    const column = columns.find((candidate) => candidate.id === columnId);
    if (!column) return;

    selectedColumnId = column.id;
    selectedCardId = column.cards[Math.max(0, preferredCardIndex)]?.id ?? null;

    if (!column.locked && !expandedColumnIds.includes(column.id)) {
      const primaryColumnId = getPrimaryColumnId();
      expandedColumnIds = [primaryColumnId, column.id].filter(
        (value, index, values): value is string =>
          !!value && values.indexOf(value) === index,
      );
    }
  }

  function selectCardByOffset(offset: number): void {
    const column =
      columns.find((candidate) => candidate.id === selectedColumnId) ??
      selectedContext?.column;
    if (!column || column.cards.length === 0) return;

    const currentIndex = selectedCardId
      ? column.cards.findIndex((card) => card.id === selectedCardId)
      : -1;
    const nextIndex = Math.max(
      0,
      Math.min(column.cards.length - 1, currentIndex + offset),
    );
    selectedCardId = column.cards[nextIndex]?.id ?? null;
    selectedColumnId = column.id;
  }

  function selectColumnByOffset(offset: number): void {
    const currentIndex = Math.max(
      0,
      columns.findIndex((column) => column.id === selectedColumnId),
    );
    const nextIndex = Math.max(
      0,
      Math.min(columns.length - 1, currentIndex + offset),
    );
    selectColumn(columns[nextIndex]!.id, 0);
  }

  async function moveCardToColumn(
    cardId: string,
    toColumnId: string,
  ): Promise<void> {
    if (!movesEnabled) return;
    const targetColumn = columns.find((column) => column.id === toColumnId);
    if (!targetColumn) return;

    await onMoveCardToColumn(cardId, toColumnId);

    if (!targetColumn.locked) {
      const primaryColumnId = getPrimaryColumnId();
      expandedColumnIds = [primaryColumnId, toColumnId].filter(
        (value, index, values): value is string =>
          !!value && values.indexOf(value) === index,
      );
    }
    selectedColumnId = toColumnId;
    selectedCardId = cardId;
  }

  async function moveCard(
    cardId: string,
    fromColumnId: string,
    direction: -1 | 1,
  ): Promise<void> {
    const fromIndex = columns.findIndex((column) => column.id === fromColumnId);
    const toIndex = fromIndex + direction;
    const toColumn = columns[toIndex];
    if (!toColumn) return;
    await moveCardToColumn(cardId, toColumn.id);
  }

  async function moveSelectedCard(direction: -1 | 1): Promise<void> {
    if (!selectedContext) return;
    await moveCard(
      selectedContext.card.id,
      selectedContext.column.id,
      direction,
    );
  }

  function openCard(columnId: string, cardId: string): void {
    selectCard(columnId, cardId);
    pinsExpanded = false;
    if (onCardOpen) {
      onCardOpen(cardId, columnId);
      return;
    }
    detailOpen = true;
  }

  function openColumnView(columnId: string): void {
    columnViewId = columnId;
    columnViewOpen = true;
    pinsExpanded = false;
    selectedColumnId = columnId;
    const column = columns.find((candidate) => candidate.id === columnId);
    selectedCardId = column?.cards[0]?.id ?? null;
    if (columnId !== getPrimaryColumnId()) {
      const primaryColumnId = getPrimaryColumnId();
      expandedColumnIds = [primaryColumnId, columnId].filter(
        (value, index, values): value is string =>
          !!value && values.indexOf(value) === index,
      );
    }
  }

  async function togglePin(cardId: string): Promise<void> {
    await onTogglePin?.(cardId);
  }

  function getReorderableColumnIds(): string[] {
    return columns
      .filter((column) => !column.isFixedPosition)
      .map((column) => column.id);
  }

  function canMoveColumn(columnId: string, direction: -1 | 1): boolean {
    const reorderable = getReorderableColumnIds();
    const currentIndex = reorderable.indexOf(columnId);
    const nextIndex = currentIndex + direction;
    return (
      currentIndex >= 0 && nextIndex >= 0 && nextIndex < reorderable.length
    );
  }

  function moveColumn(columnId: string, direction: -1 | 1): void {
    const reorderable = getReorderableColumnIds();
    const currentIndex = reorderable.indexOf(columnId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= reorderable.length) {
      return;
    }

    const nextOrder = [...reorderable];
    const [column] = nextOrder.splice(currentIndex, 1);
    nextOrder.splice(nextIndex, 0, column!);
    onReorderColumns(nextOrder);
  }

  function handlePinnedCardClick(columnId: string, cardId: string): void {
    if (pinnedCards.length > 1 && !pinsExpanded) {
      pinsExpanded = true;
      return;
    }

    openCard(columnId, cardId);
  }

  function handleCardDragEnd(): void {
    draggedCardId = null;
  }

  function handleDropCard(cardId: string, targetColumnId: string): void {
    void moveCardToColumn(cardId, targetColumnId);
    draggedCardId = null;
  }

  function handleDragStart(event: DragStartEvent): void {
    const data = event.operation.source?.data;
    if (data?.type !== "kanban-card") {
      return;
    }

    draggedCardId = data.cardId as string;
    const context = columns.find((column) =>
      column.cards.some((card) => card.id === draggedCardId),
    );
    if (context) {
      selectCard(context.id, data.cardId as string);
    }
  }

  function handleDragEnd(event: DragEndEvent): void {
    const source = event.operation.source?.data;
    const target = event.operation.target?.data;

    if (
      !event.canceled &&
      source?.type === "kanban-card" &&
      target?.type === "kanban-column"
    ) {
      handleDropCard(source.cardId as string, target.columnId as string);
      return;
    }

    handleCardDragEnd();
  }

  function handleBoardKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || !isKeyboardScopeActive(boardRoot, event)) {
      return;
    }

    if (detailOpen || columnViewOpen) {
      if (event.key === "Escape") {
        detailOpen = false;
        columnViewOpen = false;
      }
      return;
    }

    if (event.target instanceof HTMLElement) {
      const interactive = event.target.closest(
        "button, a, input, textarea, select, [role='dialog']",
      );
      if (interactive && event.key !== "Escape") return;
    }

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        if (event.shiftKey) void moveSelectedCard(-1);
        else selectColumnByOffset(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        if (event.shiftKey) void moveSelectedCard(1);
        else selectColumnByOffset(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        selectCardByOffset(-1);
        break;
      case "ArrowDown":
        event.preventDefault();
        selectCardByOffset(1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (selectedCardId && selectedColumnId) {
          openCard(selectedColumnId, selectedCardId);
        } else if (selectedColumnId) {
          toggleColumn(selectedColumnId);
        }
        break;
      case "Home":
        event.preventDefault();
        selectColumn(columns[0]?.id ?? getPrimaryColumnId() ?? "", 0);
        break;
      case "End":
        event.preventDefault();
        selectColumn(columns.at(-1)?.id ?? getPrimaryColumnId() ?? "", 0);
        break;
      case "Escape":
        event.preventDefault();
        if (pinsExpanded) {
          pinsExpanded = false;
        } else {
          collapseToBoardView();
        }
        break;
      case "P":
      case "p":
        if (event.shiftKey && selectedCardId) {
          event.preventDefault();
          void togglePin(selectedCardId);
        }
        break;
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
</script>

<svelte:window onkeydown={handleBoardKeydown} />

<DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
  <section
    role="group"
    bind:this={boardRoot}
    class="board-root"
    data-ui-component="kanban-board"
    data-ui-part="root"
    aria-label={ariaLabel}
  >
    {#if columns.length === 0}
      <div class="board-empty-state" data-ui-part="board-empty">
        <div>
          <div class="board-empty-state__title">{emptyTitle}</div>
          <div class="board-empty-state__copy">{emptyDescription}</div>
        </div>
      </div>
    {:else}
      <ScrollArea class="board-scroll" orientation="horizontal" fillContent>
        <div class="board-row">
          {#each columns as column (column.id)}
            <KanbanColumn
              {column}
              expanded={isExpanded(column.id)}
              collapseEnabled={column.id !== getPrimaryColumnId()}
              {cardSnippets}
              {columnActions}
              {selectedCardId}
              selectedColumn={selectedColumnId === column.id}
              {movesEnabled}
              {draggedCardId}
              onToggle={() => toggleColumn(column.id)}
              onMoveCard={(cardId, direction) =>
                void moveCard(cardId, column.id, direction)}
              onSelectCard={(cardId) => selectCard(column.id, cardId)}
              onOpenCard={(cardId) => openCard(column.id, cardId)}
              onOpenColumnView={() => openColumnView(column.id)}
              canMoveColumnLeft={canMoveColumn(column.id, -1)}
              canMoveColumnRight={canMoveColumn(column.id, 1)}
              onMoveColumnLeft={() => moveColumn(column.id, -1)}
              onMoveColumnRight={() => moveColumn(column.id, 1)}
              onEditColumn={(meta) => onEditColumn(column.id, meta)}
            />
          {/each}
        </div>
      </ScrollArea>

      {#if pinnedCards.length}
        <section
          role="group"
          class="pins-corner {pinsExpanded ? 'is-expanded' : ''}"
          aria-label="Pinned cards"
          data-ui-part="pins-corner"
        >
          {#each pinnedCards as { column, card }, index (card.id)}
            <button
              type="button"
              class="pin-card"
              style={`--pin-index: ${index}; --card-color: ${card.color}`}
              aria-label={`Open pinned card ${[
                column.label,
                card.title,
                card.updatedAt,
              ]
                .filter(Boolean)
                .join(" ")}`}
              onclick={() => handlePinnedCardClick(column.id, card.id)}
            >
              <span class="pin-board">{column.label}</span>
              <strong>{card.title}</strong>
              <span>{card.updatedAt}</span>
            </button>
          {/each}
        </section>
      {/if}
    {/if}
  </section>

  <DragOverlay>
    {#snippet children(_source)}
      {#if draggedCard}
        <div
          class="kanban-card kanban-card--overlay"
          style={`--card-color: ${draggedCard.card.color}`}
        >
          <div class="kanban-card-overlay-status">
            {draggedCard.card.statusText ?? "Card"}
          </div>
          <div class="kanban-card-overlay-title">{draggedCard.card.title}</div>
        </div>
      {/if}
    {/snippet}
  </DragOverlay>

  <KanbanCardDetail
    card={selectedContext?.card ?? null}
    columnLabel={selectedContext?.column.label ?? ""}
    columnId={selectedContext?.column.id ?? ""}
    isCompleted={selectedContext?.column.isCompleted ?? false}
    columns={columns.map((column) => ({ id: column.id, label: column.label }))}
    bind:open={detailOpen}
    onClose={() => {
      detailOpen = false;
    }}
    onMoveToColumn={async (columnId) => {
      if (!selectedContext) return;
      await moveCardToColumn(selectedContext.card.id, columnId);
    }}
    onTogglePin={onTogglePin
      ? () => {
          if (selectedCardId) void togglePin(selectedCardId);
        }
      : undefined}
    onPromoteGolden={onPromoteGolden
      ? () => {
          if (selectedCardId) void onPromoteGolden?.(selectedCardId);
        }
      : undefined}
    onSaveTitle={onSaveTitle
      ? async (title) => {
          if (!selectedContext) return null;
          const nextId = await onSaveTitle?.(selectedContext.card.id, title);
          if (nextId) selectedCardId = nextId;
          return nextId ?? null;
        }
      : undefined}
    onMarkDone={columns.some((column) => column.isCompleted)
      ? async () => {
          if (!selectedContext || !movesEnabled) return;
          const doneColumn = columns.find((column) => column.isCompleted);
          if (doneColumn)
            await moveCardToColumn(selectedContext.card.id, doneColumn.id);
        }
      : undefined}
    {brandLabel}
    {brand}
    body={detailBody}
    {cardSnippets}
    {movesEnabled}
    beforeClose={beforeDetailClose}
  />

  <KanbanColumnView
    column={columnViewContext}
    {cardSnippets}
    {movesEnabled}
    bind:open={columnViewOpen}
    {selectedCardId}
    onClose={() => {
      columnViewOpen = false;
    }}
    onSelectCard={(cardId) => {
      if (!columnViewContext) return;
      selectCard(columnViewContext.id, cardId);
    }}
    onOpenCard={(cardId) => {
      if (!columnViewContext) return;
      openCard(columnViewContext.id, cardId);
      columnViewOpen = false;
    }}
    onMoveCard={(cardId, direction) => {
      if (!columnViewContext) return;
      void moveCard(cardId, columnViewContext.id, direction);
      if (selectedColumnId) {
        columnViewId = selectedColumnId;
      }
    }}
  />
</DragDropProvider>
