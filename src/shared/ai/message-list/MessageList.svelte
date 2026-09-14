<script lang="ts" generics="T extends { id: string }">
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import { Spinner } from "@lapismd/design-core/shadcn/spinner";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import * as Empty from "@lapismd/design-core/shadcn/empty";
  import VirtualizedMessageRows from "./VirtualizedMessageRows.svelte";
  import { tick, untrack, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { setListContext, useLayoutContext } from "../context.svelte.js";
  import type { Density } from "../types.js";
  import type { MessageListPosition } from "./position.js";
  import "../chat.css";

  let {
    ref = $bindable(null),
    density = "balanced",
    gap,
    isStreaming = false,
    isEmpty = false,
    emptyState,
    scrollToTopAction,
    latestMessageId,
    children,
    header,
    footer,
    items = [],
    row,
    virtualize = false,
    overscan = 6,
    estimateSize = 112,
    conversationKey,
    initialPosition,
    onPositionChange,
    retainRowIds = [],
    hasOlder = true,
    loading = false,
    "aria-label": ariaLabel = "Messages",
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLDivElement | null;
    density?: Density;
    gap?: string;
    isStreaming?: boolean;
    isEmpty?: boolean;
    emptyState?: Snippet;
    scrollToTopAction?: () => Promise<void>;
    latestMessageId?: string;
    children?: Snippet;
    /** Content before and after the rows, including in a virtualized list. */
    header?: Snippet;
    footer?: Snippet;
    items?: readonly T[];
    row?: Snippet<[T, number]>;
    /** Opt in to bounded row rendering and automatic older-page loading; defaults to false. */
    virtualize?: boolean;
    overscan?: number;
    estimateSize?: number;
    /** Scope restoration and arrivals to a conversation; existing unkeyed lists retain explicit arrival handling. */
    conversationKey?: string;
    initialPosition?: MessageListPosition;
    onPositionChange?: (position: MessageListPosition) => void;
    retainRowIds?: readonly string[];
    hasOlder?: boolean;
    loading?: boolean;
  } = $props();

  const layout = useLayoutContext();
  const componentId = $props.id();
  const errorId = `${componentId}-older-error`;
  let innerRef = $state<HTMLDivElement | null>(null);
  let loadingOlder = $state(false);
  let loadVersion = 0;
  let loadError = $state<string | null>(null);
  let arrivalKey: string | undefined;
  let previousMessageId: string | undefined;

  setListContext({ getDensity: () => density });

  $effect(() => {
    layout?.setContent(innerRef);
    return () => layout?.setContent(null);
  });
  $effect(() => {
    const key = conversationKey,
      latest = latestMessageId;
    if (
      latest &&
      (key === undefined ||
        (arrivalKey === key && latest !== previousMessageId))
    )
      untrack(() => layout?.newMessages.notify(latest));
    arrivalKey = key;
    previousMessageId = latest;
  });

  $effect(() => {
    void conversationKey;
    loadVersion++;
    loadingOlder = false;
    loadError = null;
  });

  async function loadOlder(): Promise<void> {
    if (!scrollToTopAction || loadingOlder || loading || !hasOlder) return;
    const key = conversationKey;
    const version = loadVersion;
    loadingOlder = true;
    loadError = null;
    const viewport = layout?.getScrollContainer();
    const previousHeight = viewport?.scrollHeight ?? 0;
    const revision = layout?.streamScroll.positionRevision;
    const restore =
      !virtualize && conversationKey !== undefined
        ? layout?.streamScroll.captureAnchor?.()
        : undefined;
    try {
      await scrollToTopAction();
      await tick();
      if (key === conversationKey && version === loadVersion) {
        if (restore) restore();
        else if (
          !virtualize &&
          viewport &&
          revision === layout?.streamScroll.positionRevision
        )
          layout?.streamScroll.scrollToOffset?.(
            viewport.scrollTop + viewport.scrollHeight - previousHeight,
            true,
          );
      }
    } catch (error) {
      if (key === conversationKey && version === loadVersion)
        loadError =
          error instanceof Error ? error.message : "Could not load messages";
    } finally {
      if (key === conversationKey && version === loadVersion)
        loadingOlder = false;
    }
  }
</script>

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-message-list"
  data-ui-part="root"
  data-density={density}
  role="log"
  aria-label={ariaLabel}
  aria-live="polite"
  aria-relevant="additions text"
  aria-busy={isStreaming || loadingOlder || loading}
>
  <div bind:this={innerRef} data-ui-part="list-inner" style:gap>
    {#if scrollToTopAction && hasOlder}
      <div data-ui-part="top-sentinel">
        <Button
          type="button"
          size="xs"
          variant="ghost"
          disabled={loadingOlder || loading}
          aria-describedby={loadError ? errorId : undefined}
          onclick={loadOlder}
        >
          {#if loadingOlder || loading}<Spinner /> Loading older messages{:else if loadError}Retry
            older messages{:else}Load older messages{/if}
        </Button>
      </div>
      {#if loadError}<p id={errorId} role="alert">{loadError}</p>{/if}
    {/if}
    <div data-ui-part="list-spacer" aria-hidden="true"></div>
    {#if header}{@render header()}{/if}
    {#if isEmpty}
      <div data-ui-part="empty">
        {#if emptyState}{@render emptyState()}{:else}
          <Empty.Root
            ><Empty.Header
              ><Empty.Media variant="icon"
                ><SparklesIcon aria-hidden="true" /></Empty.Media
              ><Empty.Title>No messages yet</Empty.Title><Empty.Description
                >The conversation will appear here.</Empty.Description
              ></Empty.Header
            ></Empty.Root
          >
        {/if}
      </div>
    {:else if virtualize && row}
      <VirtualizedMessageRows
        {items}
        {row}
        {overscan}
        {estimateSize}
        conversationKey={conversationKey ?? ""}
        {initialPosition}
        {onPositionChange}
        {retainRowIds}
        {hasOlder}
        loading={loadingOlder || loading}
        onLoadOlder={loadOlder}
      />
    {:else if row}
      {#each items as item, index (item.id)}<div data-message-id={item.id}>
          {@render row(item, index)}
        </div>{/each}
    {:else if children}{@render children()}{/if}
    {#if footer}{@render footer()}{/if}
  </div>
</div>
