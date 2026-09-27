<script lang="ts" generics="Row extends { key: string }">
  import { createVirtualizer } from "@tanstack/svelte-virtual";
  import { get } from "svelte/store";
  import { onDestroy, untrack, type Snippet } from "svelte";

  let {
    rows,
    row,
    estimateSize = 32,
    overscan = 8,
    loading = false,
    hasMore = false,
    loadingLabel = "Loading more files",
    onLoadMore,
  }: {
    rows: readonly Row[];
    row: Snippet<[Row, number]>;
    estimateSize?: number;
    overscan?: number;
    loading?: boolean;
    hasMore?: boolean;
    loadingLabel?: string;
    onLoadMore?: () => void;
  } = $props();

  let host: HTMLDivElement;
  let scrollElement = $state<HTMLElement | null | undefined>(undefined);
  let alive = true;
  let lastLoadMoreKey = "";

  const virtualizer = createVirtualizer<HTMLElement, HTMLDivElement>({
    count: 0,
    getScrollElement: () => scrollElement ?? null,
    getItemKey: (index) => rows[index]?.key ?? index,
    estimateSize: () => estimateSize,
    enabled: false,
    overscan: 0,
    useAnimationFrameWithResizeObserver: true,
  });

  onDestroy(() => {
    alive = false;
  });

  function nearestScrollElement(node: HTMLElement): HTMLElement | null {
    let current = node.parentElement;
    while (current) {
      const style = getComputedStyle(current);
      if (/(auto|scroll|overlay)/u.test(`${style.overflowY} ${style.overflow}`))
        return current;
      current = current.parentElement;
    }
    return null;
  }

  function measure(node: HTMLDivElement) {
    untrack(() => get(virtualizer).measureElement(node));
    return {
      destroy() {
        untrack(() => {
          if (alive) get(virtualizer).measureElement(null);
        });
      },
    };
  }

  export function scrollToIndex(index: number): void {
    get(virtualizer).scrollToIndex(index, { align: "auto" });
  }

  $effect(() => {
    scrollElement = nearestScrollElement(host);
  });

  $effect(() => {
    const nextRows = rows;
    const nextScrollElement = scrollElement;
    const nextEstimate = estimateSize;
    const nextOverscan = overscan;
    untrack(() =>
      get(virtualizer).setOptions({
        enabled: nextScrollElement != null,
        count: nextRows.length,
        getScrollElement: () => nextScrollElement ?? null,
        getItemKey: (index) => nextRows[index]?.key ?? index,
        estimateSize: () => nextEstimate,
        overscan: nextOverscan,
      }),
    );
  });

  $effect(() => {
    const items = $virtualizer.getVirtualItems();
    const last = items.at(-1);
    if (!last || rows.length === 0 || !hasMore || loading || !onLoadMore)
      return;
    if (last.index < Math.max(0, rows.length - Math.max(4, overscan))) return;
    const finalRow = rows.at(-1);
    if (!finalRow) return;
    const loadKey = `${rows.length}:${finalRow.key}`;
    if (loadKey === lastLoadMoreKey) return;
    lastLoadMoreKey = loadKey;
    onLoadMore();
  });
</script>

<div bind:this={host} class="ui-diff-file-listing__virtual-rows">
  {#if scrollElement}
    <div
      class="ui-diff-file-listing__virtual-content"
      style:height={`${$virtualizer.getTotalSize()}px`}
    >
      {#each $virtualizer.getVirtualItems() as virtualRow (virtualRow.key)}
        {@const item = rows[virtualRow.index]}
        {#if item}
          <div
            class="ui-diff-file-listing__virtual-row"
            data-ui-part="virtual-row"
            data-index={virtualRow.index}
            data-row-index={virtualRow.index}
            style:transform={`translateY(${virtualRow.start}px)`}
            use:measure
          >
            {@render row(item, virtualRow.index)}
          </div>
        {/if}
      {/each}
    </div>
  {:else if scrollElement === null}
    {#each rows as item, index (item.key)}
      <div data-ui-part="virtual-row" data-row-index={index}>
        {@render row(item, index)}
      </div>
    {/each}
  {/if}
  {#if loading}
    <p class="ui-diff-file-listing__loading" role="status" aria-busy="true">
      {loadingLabel}
    </p>
  {/if}
</div>

<style>
  .ui-diff-file-listing__virtual-rows {
    min-width: 0;
  }
  .ui-diff-file-listing__virtual-content {
    position: relative;
    width: 100%;
  }
  .ui-diff-file-listing__virtual-row {
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
    width: 100%;
  }
  .ui-diff-file-listing__loading {
    margin: 0;
    padding: 0.75rem;
    color: var(--muted-foreground);
    text-align: center;
  }
</style>
