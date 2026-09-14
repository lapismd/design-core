<script lang="ts" generics="T extends { id: string }">
  import {
    createVirtualizer,
    defaultRangeExtractor,
  } from "@tanstack/svelte-virtual";
  import { get } from "svelte/store";
  import { onDestroy, tick, untrack, type Snippet } from "svelte";
  import { useLayoutContext } from "../context.svelte.js";
  import type { MessageListPosition } from "./position.js";

  let {
    items,
    row,
    overscan,
    estimateSize,
    conversationKey,
    initialPosition,
    onPositionChange,
    retainRowIds,
    hasOlder,
    loading,
    onLoadOlder,
  }: {
    items: readonly T[];
    row: Snippet<[T, number]>;
    overscan: number;
    estimateSize: number;
    conversationKey: string;
    initialPosition?: MessageListPosition | undefined;
    onPositionChange?: ((position: MessageListPosition) => void) | undefined;
    retainRowIds: readonly string[];
    hasOlder: boolean;
    loading: boolean;
    onLoadOlder?: () => Promise<void>;
  } = $props();
  const layout = useLayoutContext();
  const stableKey = $derived(conversationKey);
  const stableItems = $derived(items);
  let virtualRef = $state<HTMLDivElement | null>(null);
  let activeRowId = $state<string>();
  let margin = $state(0);
  let restoredKey: string | undefined;
  let priorKey: string | undefined;
  let priorItems: readonly T[] = [];
  let paginationArmed = false;
  let lastTop = 0;
  let alive = true;
  onDestroy(() => {
    alive = false;
  });
  const virtualizer = createVirtualizer<HTMLElement, HTMLDivElement>({
    count: 0,
    getScrollElement: () => layout?.getScrollContainer() ?? null,
    estimateSize: () => estimateSize,
    enabled: false,
    useAnimationFrameWithResizeObserver: true,
    scrollToFn: (offset, options) =>
      layout?.streamScroll.scrollToOffset?.(
        offset + (options.adjustments ?? 0),
        true,
      ),
  });

  $effect(() => {
    layout?.setVirtualized?.(true);
    return () => layout?.setVirtualized?.(false);
  });

  function readPosition(): MessageListPosition | undefined {
    const instance = get(virtualizer);
    const viewport = layout?.getScrollContainer();
    if (!viewport || !items.length) return;
    const first = instance
      .getVirtualItems()
      .find((item) => item.end > viewport.scrollTop);
    const item = first && items[first.index];
    if (!first || !item) return;
    return {
      messageId: item.id,
      index: first.index,
      offset: viewport.scrollTop - first.start,
      atLatest: layout?.streamScroll.isLocked ?? false,
    };
  }

  function reportPosition() {
    if (
      restoredKey !== conversationKey ||
      document.visibilityState === "hidden"
    )
      return;
    const position = readPosition();
    if (position) untrack(() => onPositionChange?.(position));
  }

  function measure(node: HTMLDivElement) {
    untrack(() => get(virtualizer).measureElement(node));
    return {
      destroy() {
        untrack(() => get(virtualizer).measureElement(null));
      },
    };
  }

  // Inputs alone invalidate the virtualizer. Its returned ranges must never restart this effect.
  $effect(() => {
    const nextItems = stableItems,
      key = stableKey,
      enabled = true,
      scrollMargin = margin;
    const keep = [...retainRowIds, ...(activeRowId ? [activeRowId] : [])];
    const extra = keep
      .map((id) => nextItems.findIndex((item) => item.id === id))
      .filter((index) => index >= 0);
    const size = estimateSize,
      scan = overscan;
    untrack(() => {
      const instance = get(virtualizer);
      const viewport = layout?.getScrollContainer();
      const oldRow = instance
        .getVirtualItems()
        .find((item) => item.end > (viewport?.scrollTop ?? 0));
      const oldItem = oldRow && priorItems[oldRow.index];
      const offset = oldRow ? (viewport?.scrollTop ?? 0) - oldRow.start : 0;
      const revision = layout?.streamScroll.positionRevision;
      const sameKey = priorKey === key;
      const restore = restoredKey !== key ? initialPosition : undefined;
      const preserve =
        sameKey &&
        nextItems !== priorItems &&
        !layout?.streamScroll.isLocked &&
        oldItem;
      priorKey = key;
      priorItems = nextItems;
      if (!sameKey) {
        restoredKey = undefined;
        paginationArmed = false;
        activeRowId = undefined;
      }
      instance.setOptions({
        enabled,
        count: nextItems.length,
        scrollMargin,
        getScrollElement: () => layout?.getScrollContainer() ?? null,
        getItemKey: (index) => nextItems[index]!.id,
        estimateSize: () => size,
        overscan: scan,
        rangeExtractor: (range) =>
          [...new Set([...defaultRangeExtractor(range), ...extra])].sort(
            (a, b) => a - b,
          ),
      });
      void tick().then(() => {
        if (!alive) return;
        if (
          key !== conversationKey ||
          revision !== layout?.streamScroll.positionRevision
        )
          return;
        if (enabled && nextItems.length) {
          const position =
            restore ??
            (preserve
              ? {
                  messageId: oldItem.id,
                  index: oldRow!.index,
                  offset,
                  atLatest: false,
                }
              : undefined);
          if (position && !position.atLatest) {
            const found = nextItems.findIndex(
              (item) => item.id === position.messageId,
            );
            const index =
              found < 0
                ? Math.min(position.index ?? 0, nextItems.length - 1)
                : found;
            const start = get(virtualizer).getOffsetForIndex(
              index,
              "start",
            )?.[0];
            if (start !== undefined)
              layout?.streamScroll.scrollToOffset?.(
                start + position.offset,
                Boolean(preserve),
              );
          } else if (!sameKey || layout?.streamScroll.isLocked)
            layout?.streamScroll.scrollIfLocked();
        }
        if (nextItems.length) {
          restoredKey = key;
          reportPosition();
        }
      });
    });
  });
  $effect(() => {
    const content = virtualRef;
    const viewport = layout?.getScrollContainer();
    if (!content || !viewport) return;
    const measureMargin = () => {
      const next =
        content.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top +
        viewport.scrollTop;
      if (Math.abs(next - margin) > 0.5) margin = next;
    };
    measureMargin();
    const observer = new ResizeObserver(measureMargin);
    observer.observe(content);
    return () => observer.disconnect();
  });
  $effect(() => {
    const viewport = layout?.getScrollContainer();
    if (!viewport) return;
    const onScroll = () => {
      const top = viewport.scrollTop;
      if (top > 600) paginationArmed = true;
      if (
        top <= 600 &&
        top < lastTop &&
        paginationArmed &&
        hasOlder &&
        !loading
      ) {
        paginationArmed = false;
        void onLoadOlder?.();
      }
      lastTop = top;
      reportPosition();
    };
    const rememberInteraction = (event: Event) => {
      const target = event.target;
      if (target instanceof Element)
        activeRowId =
          target.closest<HTMLElement>("[data-message-id]")?.dataset.messageId;
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    viewport.addEventListener("focusin", rememberInteraction);
    viewport.addEventListener("pointerdown", rememberInteraction, {
      passive: true,
    });
    return () => {
      viewport.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("focusin", rememberInteraction);
      viewport.removeEventListener("pointerdown", rememberInteraction);
    };
  });
</script>

<div
  bind:this={virtualRef}
  data-ui-part="virtual-content"
  style:height={`${$virtualizer.getTotalSize()}px`}
>
  {#each $virtualizer.getVirtualItems() as virtualRow (virtualRow.key)}
    {@const item = items[virtualRow.index]}
    {#if item}
      <div
        data-ui-part="virtual-row"
        data-message-id={item.id}
        data-index={virtualRow.index}
        style:transform={`translateY(${virtualRow.start - margin}px)`}
        use:measure
      >
        {@render row(item, virtualRow.index)}
      </div>
    {/if}
  {/each}
</div>
