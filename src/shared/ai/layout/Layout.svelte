<script lang="ts">
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import * as Empty from "@stevejuma/ui/shadcn/empty";
  import { ScrollArea } from "@stevejuma/ui/shadcn/scroll-area";
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
  const streamScroll = createStreamScroll();
  const newMessages = createNewMessages({
    isLocked: () => streamScroll.isLocked,
    onResize: () => {
      streamScroll.scrollIfLocked();
      streamScroll.update();
    },
  });

  function setContent(element: HTMLElement | null): void {
    contentRef = element;
    newMessages.attach(element);
  }

  function scrollToBottom(): void {
    streamScroll.scrollToBottom();
    newMessages.dismiss();
  }

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
  </div>

  {#if scrollButton}
    {@render scrollButton({
      isVisible: streamScroll.isScrolledUp || newMessages.hasNewMessages,
      hasNewMessages: newMessages.hasNewMessages,
      scrollToBottom,
    })}
  {:else}
    <LayoutScrollButton
      isVisible={streamScroll.isScrolledUp || newMessages.hasNewMessages}
      hasNewMessages={newMessages.hasNewMessages}
      onClick={scrollToBottom}
    />
  {/if}

  <div data-ui-part="composer-dock">
    <div data-ui-part="composer-inner">
      {@render composer()}
    </div>
  </div>
</div>
