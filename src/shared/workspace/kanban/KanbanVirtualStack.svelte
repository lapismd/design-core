<script lang="ts">
  import {
    createVirtualizer,
    defaultRangeExtractor,
  } from "@tanstack/svelte-virtual";
  import { get } from "svelte/store";
  import { onDestroy, tick, untrack, type Snippet } from "svelte";
  import type { KanbanCardData } from "./kanban-types.js";

  let {
    cards,
    viewport,
    selectedCardId,
    draggedCardId,
    row,
  }: {
    cards: readonly KanbanCardData[];
    viewport: HTMLElement | null;
    selectedCardId: string | null;
    draggedCardId: string | null;
    row: Snippet<[KanbanCardData]>;
  } = $props();
  let host = $state<HTMLDivElement>();
  let focusedId = $state<string | null>(null);
  let previousCards: readonly KanbanCardData[] = [];
  let previousSelection: string | null | undefined;
  let alive = true;
  const virtualizer = createVirtualizer<HTMLElement, HTMLDivElement>({
    count: 0,
    getScrollElement: () => viewport,
    estimateSize: () => 280,
    overscan: 4,
    enabled: false,
    useAnimationFrameWithResizeObserver: true,
  });
  onDestroy(() => {
    alive = false;
  });

  function measure(node: HTMLDivElement) {
    untrack(() => get(virtualizer).measureElement(node));
    return {
      destroy() {
        untrack(() => get(virtualizer).measureElement(null));
      },
    };
  }

  // Changes to visible ranges must not invalidate the input configuration.
  $effect(() => {
    const nextCards = cards.slice(),
      scroll = viewport,
      content = host;
    const keep = [selectedCardId, draggedCardId, focusedId];
    untrack(() => {
      const instance = get(virtualizer);
      const first = instance
        .getVirtualItems()
        .find((item) => item.end > (scroll?.scrollTop ?? 0));
      const anchor = first && previousCards[first.index];
      const offset = first ? (scroll?.scrollTop ?? 0) - first.start : 0;
      const changed =
        previousCards.length > 0 &&
        (previousCards.length !== nextCards.length ||
          previousCards.some((card, index) => card !== nextCards[index]));
      const style = content && getComputedStyle(content);
      const extra = keep
        .map((id) => nextCards.findIndex((card) => card.id === id))
        .filter((index) => index >= 0);
      previousCards = nextCards;
      instance.setOptions({
        enabled: !!scroll,
        count: nextCards.length,
        getScrollElement: () => scroll,
        getItemKey: (index) => nextCards[index]!.id,
        estimateSize: () => 280,
        gap: style ? parseFloat(style.rowGap) || 16 : 16,
        paddingStart: style ? parseFloat(style.paddingTop) || 0 : 12,
        paddingEnd: style ? parseFloat(style.paddingBottom) || 0 : 16,
        overscan: 4,
        rangeExtractor: (range) =>
          [...new Set([...defaultRangeExtractor(range), ...extra])].sort(
            (a, b) => a - b,
          ),
      });
      if (changed && anchor && scroll) {
        const index = nextCards.findIndex((card) => card.id === anchor.id);
        if (index >= 0)
          void tick().then(() => {
            if (!alive || previousCards !== nextCards) return;
            const start = get(virtualizer).getOffsetForIndex(
              index,
              "start",
            )?.[0];
            if (start !== undefined) scroll.scrollTop = start + offset;
          });
      }
    });
  });

  $effect(() => {
    const id = selectedCardId,
      scroll = viewport;
    untrack(() => {
      if (!scroll || previousSelection === id) return;
      previousSelection = id;
      const index = cards.findIndex((card) => card.id === id);
      if (index < 0) return;
      const focused = document.activeElement;
      const ownsKeyboard =
        focused instanceof HTMLElement &&
        focused.closest(".kanban-card") &&
        focused.closest('[data-ui-component="kanban-board"]') ===
          host?.closest('[data-ui-component="kanban-board"]');
      get(virtualizer).scrollToIndex(index, { align: "auto" });
      void tick().then(() => {
        if (
          !alive ||
          !ownsKeyboard ||
          document.activeElement !== focused ||
          selectedCardId !== id
        )
          return;
        host
          ?.querySelector<HTMLElement>(
            `[data-virtual-card-id="${CSS.escape(id!)}"] .kanban-card`,
          )
          ?.focus({ preventScroll: true });
      });
    });
  });

  function rememberFocus(event: FocusEvent) {
    if (event.target instanceof Element)
      focusedId =
        event.target.closest<HTMLElement>("[data-virtual-card-id]")?.dataset
          .virtualCardId ?? null;
  }
</script>

<div
  bind:this={host}
  class="column-stack-inner kanban-virtual-stack"
  data-ui-part="virtual-card-stack"
  style:height={`${$virtualizer.getTotalSize()}px`}
  onfocusin={rememberFocus}
  onfocusout={(event) => {
    if (
      !(event.relatedTarget instanceof Node) ||
      !host?.contains(event.relatedTarget)
    )
      focusedId = null;
  }}
>
  {#each $virtualizer.getVirtualItems() as virtualRow (virtualRow.key)}
    {@const card = cards[virtualRow.index]}
    {#if card}
      <div
        class="kanban-virtual-row"
        data-ui-part="virtual-card-row"
        data-index={virtualRow.index}
        data-virtual-card-id={card.id}
        style:transform={`translateY(${virtualRow.start}px)`}
        use:measure
      >
        {@render row(card)}
      </div>
    {/if}
  {/each}
</div>

<style>
  .kanban-virtual-stack {
    position: relative;
    display: block;
    box-sizing: border-box;
  }
  .kanban-virtual-row {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0.5rem;
  }
</style>
