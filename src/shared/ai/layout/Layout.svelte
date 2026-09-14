<script lang="ts">
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import { untrack, type Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import * as Empty from "@lapismd/design-core/shadcn/empty";
  import { ScrollArea } from "@lapismd/design-core/shadcn/scroll-area";
  import { createNewMessages } from "../new-messages.svelte.js";
  import { createStreamScroll } from "../stream-scroll.svelte.js";
  import { setLayoutContext } from "../context.svelte.js";
  import LayoutScrollButton from "../layout-scroll-button/LayoutScrollButton.svelte";
  import type { Density } from "../types.js";
  import "../chat.css";

  let {
    ref = $bindable(null),
    scrollRef = $bindable(null),
    density = "balanced",
    isEmpty = false,
    scrollMode = "stream",
    conversationKey,
    hasNewMessages: controlledNewMessages,
    hasNewer = false,
    onLoadLatest,
    onViewportChange,
    emptyState,
    scrollButton,
    composer,
    children,
    "aria-label": ariaLabel = "Conversation",
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLDivElement | null;
    scrollRef?: HTMLElement | null;
    density?: Density;
    isEmpty?: boolean;
    /** Keep streaming scroll behavior by default; opt in to anchored cached-history navigation. */
    scrollMode?: "stream" | "history";
    conversationKey?: string;
    hasNewMessages?: boolean;
    hasNewer?: boolean;
    onLoadLatest?: () => Promise<void>;
    onViewportChange?: (state: { atLatest: boolean; active: boolean }) => void;
    emptyState?: Snippet;
    scrollButton?: Snippet<
      [
        {
          isVisible: boolean;
          hasNewMessages: boolean;
          scrollToBottom: () => void;
        },
      ]
    >;
    composer: Snippet;
    children: Snippet;
  } = $props();

  let messageAreaRef = $state<HTMLElement | null>(null);
  let contentRef = $state<HTMLElement | null>(null);
  const streamScroll = createStreamScroll({
    anchorOnResize: () => scrollMode === "history",
  });
  const newMessages = createNewMessages({
    isLocked: () => streamScroll.isLocked,
    onResize: () => {
      if (scrollMode === "history") streamScroll.contentResized();
      else {
        streamScroll.scrollIfLocked();
        streamScroll.update();
      }
    },
  });

  function setContent(element: HTMLElement | null): void {
    contentRef = element;
    newMessages.attach(element);
  }

  let pendingJump = false;
  let jumpVersion = 0;
  let jumpError = $state<string | undefined>();
  let documentActive = $state(true);
  const unread = $derived(controlledNewMessages ?? newMessages.hasNewMessages);
  const showNewMessages = $derived(
    unread && (!streamScroll.isLocked || hasNewer || !documentActive),
  );
  const showScrollButton = $derived(
    streamScroll.isScrolledUp || showNewMessages || hasNewer,
  );
  function scrollToBottom(): void {
    if (pendingJump) return;
    if (scrollMode === "stream" && !onLoadLatest) {
      newMessages.dismiss();
      streamScroll.scrollToBottom();
      return;
    }
    const key = conversationKey;
    const version = ++jumpVersion;
    const revision = streamScroll.positionRevision;
    pendingJump = true;
    jumpError = undefined;
    void (async () => {
      try {
        await onLoadLatest?.();
        if (
          key === conversationKey &&
          version === jumpVersion &&
          revision === streamScroll.positionRevision
        )
          streamScroll.scrollToBottom({
            behavior: scrollMode === "history" ? "instant" : "spring",
          });
      } catch (cause) {
        if (key === conversationKey && version === jumpVersion)
          jumpError =
            cause instanceof Error
              ? cause.message
              : "Could not load latest messages";
      } finally {
        if (version === jumpVersion) pendingJump = false;
      }
    })();
  }
  $effect(() => {
    const key = conversationKey;
    untrack(() => {
      jumpVersion++;
      pendingJump = false;
      if (key === undefined) return;
      newMessages.attach(contentRef ?? messageAreaRef);
      streamScroll.attach(null);
      streamScroll.attach(scrollRef);
      jumpError = undefined;
    });
    return () => {
      void key;
    };
  });
  $effect(() => {
    if (streamScroll.isLocked && !hasNewer && documentActive)
      newMessages.dismiss();
    const observation = {
      atLatest: streamScroll.isLocked && !hasNewer,
      active: documentActive,
    };
    const notify = onViewportChange;
    untrack(() => notify?.(observation));
  });
  $effect(() => {
    const update = () => {
      documentActive = document.visibilityState !== "hidden";
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  });

  setLayoutContext({
    getScrollContainer: () => scrollRef,
    setScrollContainer(element) {
      scrollRef = element;
      streamScroll.attach(element);
    },
    setContent,
    streamScroll,
    newMessages,
  });

  $effect(() => {
    streamScroll.attach(scrollRef);
    return () => streamScroll.cleanup();
  });

  $effect(() => {
    newMessages.attach(contentRef ?? messageAreaRef);
    return () => newMessages.cleanup();
  });
</script>

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-layout"
  data-ui-part="root"
  data-density={density}
  aria-label={ariaLabel}
>
  <div data-ui-part="scroll-shell">
    <ScrollArea bind:viewportRef={scrollRef}>
      <div bind:this={messageAreaRef} data-ui-part="message-area">
        {#if isEmpty}
          <div data-ui-part="empty-state">
            {#if emptyState}
              {@render emptyState()}
            {:else}
              <Empty.Root>
                <Empty.Header>
                  <Empty.Media variant="icon">
                    <SparklesIcon aria-hidden="true" />
                  </Empty.Media>
                  <Empty.Title>Start a conversation</Empty.Title>
                  <Empty.Description>
                    Ask a question or describe the change you want to make.
                  </Empty.Description>
                </Empty.Header>
              </Empty.Root>
            {/if}
          </div>
        {:else}
          {@render children()}
        {/if}
      </div>
    </ScrollArea>
    {#if jumpError}<p role="alert" data-ui-part="history-error">
        {jumpError}
      </p>{/if}
    {#if scrollButton}
      {@render scrollButton({
        isVisible: showScrollButton,
        hasNewMessages: showNewMessages,
        scrollToBottom,
      })}
    {:else}
      <LayoutScrollButton
        isVisible={showScrollButton}
        hasNewMessages={showNewMessages}
        onClick={scrollToBottom}
      />
    {/if}
  </div>

  <div data-ui-part="composer-dock">
    <div data-ui-part="composer-inner">
      {@render composer()}
    </div>
  </div>
</div>
