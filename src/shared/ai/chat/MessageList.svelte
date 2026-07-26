<script lang="ts">
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import { Spinner } from "@stevejuma/ui/shadcn/spinner";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Empty from "@stevejuma/ui/shadcn/empty";
  import { tick, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { setListContext, useLayoutContext } from "./context.svelte.js";
  import type { Density } from "./types.js";
  import "./chat.css";

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
    children: Snippet;
  } = $props();

  const layout = useLayoutContext();
  let loadingOlder = $state(false);
  let loadError = $state<string | null>(null);

  setListContext({ getDensity: () => density });

  $effect(() => {
    layout?.setContent(ref);
    return () => layout?.setContent(null);
  });

  $effect(() => {
    if (latestMessageId) layout?.newMessages.notify(latestMessageId);
  });

  async function loadOlder(): Promise<void> {
    if (!scrollToTopAction || loadingOlder) return;
    loadingOlder = true;
    loadError = null;
    const viewport = layout?.getScrollContainer() ?? null;
    const previousHeight = viewport?.scrollHeight ?? 0;
    try {
      await scrollToTopAction();
      await tick();
      if (viewport) {
        viewport.scrollTop += viewport.scrollHeight - previousHeight;
      }
    } catch (error) {
      loadError =
        error instanceof Error ? error.message : "Could not load messages";
    } finally {
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
  style:gap
  role="log"
  aria-label={ariaLabel}
  aria-live="polite"
  aria-relevant="additions text"
  aria-busy={isStreaming || loadingOlder}
>
  {#if scrollToTopAction}
    <div data-ui-part="top-sentinel">
      <Button
        type="button"
        size="xs"
        variant="ghost"
        disabled={loadingOlder}
        aria-describedby={loadError ? "ai-chat-load-older-error" : undefined}
        onclick={loadOlder}
      >
        {#if loadingOlder}
          <Spinner />
          Loading older messages
        {:else}
          Load older messages
        {/if}
      </Button>
    </div>
    {#if loadError}
      <p id="ai-chat-load-older-error" role="alert">{loadError}</p>
    {/if}
  {/if}

  {#if isEmpty}
    <div data-ui-part="empty">
      {#if emptyState}
        {@render emptyState()}
      {:else}
        <Empty.Root>
          <Empty.Header>
            <Empty.Media variant="icon">
              <SparklesIcon aria-hidden="true" />
            </Empty.Media>
            <Empty.Title>No messages yet</Empty.Title>
            <Empty.Description>
              The conversation will appear here.
            </Empty.Description>
          </Empty.Header>
        </Empty.Root>
      {/if}
    </div>
  {:else}
    {@render children()}
  {/if}
</div>
