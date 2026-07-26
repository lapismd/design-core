<script lang="ts">
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import { ScrollArea } from "@stevejuma/ui/shadcn/scroll-area";
  import Message from "./chat/Message.svelte";
  import MessageBubble from "./chat/MessageBubble.svelte";
  import MessageList from "./chat/MessageList.svelte";
  import SystemMessage from "./chat/SystemMessage.svelte";
  import type { AiChatMessage, AiReviewChangeSummary } from "./types.js";

  let {
    messages = [],
    loading = false,
    error = null,
    emptyHint = "Ask for edits. Proposed changes can appear for review before saving.",
    reviewChanges = [],
  }: {
    messages?: AiChatMessage[];
    loading?: boolean;
    error?: string | null;
    emptyHint?: string;
    reviewChanges?: AiReviewChangeSummary[];
  } = $props();

  const isEmpty = $derived(
    !loading && !error && messages.length === 0 && reviewChanges.length === 0,
  );
</script>

<div data-ui-component="ai-chat-transcript" data-ui-part="root">
  <ScrollArea>
    <MessageList {isEmpty} density="compact" aria-label="Conversation">
      {#snippet emptyState()}
        <div data-ui-part="compatibility-empty">
          <SparklesIcon aria-hidden="true" />
          <p>{emptyHint}</p>
        </div>
      {/snippet}

      {#if loading}
        <p data-ui-part="status" role="status">Loading conversation…</p>
      {:else if error}
        <div data-ui-part="error" role="alert">{error}</div>
      {/if}

      {#each messages as message (message.id)}
        {#if message.role === "system"}
          <SystemMessage>{message.text}</SystemMessage>
        {:else}
          <Message sender={message.role}>
            <MessageBubble>{message.text}</MessageBubble>
          </Message>
        {/if}
      {/each}

      {#if reviewChanges.length > 0}
        <div data-ui-part="review">
          <p data-ui-part="review-title">Pending review</p>
          <ul>
            {#each reviewChanges as change (change.id)}
              <li>
                <span data-ui-part="review-label">{change.label}</span>
                {#if change.detail}
                  — {change.detail}
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </MessageList>
  </ScrollArea>
</div>

<style>
  :global([data-ui-component="ai-chat-transcript"][data-ui-part="root"]) {
    display: flex;
    min-height: 0;
    flex: 1 1 auto;
    flex-direction: column;
  }

  :global(
      [data-ui-component="ai-chat-transcript"][data-ui-part="root"]
        > [data-ui-component="scroll-area"]
    ) {
    min-height: 0;
    flex: 1 1 auto;
  }

  :global(
      [data-ui-component="ai-chat-transcript"]
        [data-ui-component="ai-chat-message-list"]
    ) {
    padding: 0.75rem;
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="status"]) {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.875rem;
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="error"]) {
    border: 1px solid color-mix(in oklab, var(--destructive) 40%, transparent);
    border-radius: 0.5rem;
    background: color-mix(in oklab, var(--destructive) 10%, transparent);
    padding: 0.5rem 0.75rem;
    color: color-mix(in oklab, var(--destructive) 92%, black);
    font-size: 0.875rem;
  }

  :global(
      [data-ui-component="ai-chat-transcript"]
        [data-ui-part="compatibility-empty"]
    ) {
    display: flex;
    min-height: 7rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: var(--muted-foreground);
    font-size: 0.875rem;
    text-align: center;
  }

  :global(
      [data-ui-component="ai-chat-transcript"]
        [data-ui-part="compatibility-empty"]
        svg
    ) {
    width: 1rem;
    height: 1rem;
  }

  :global(
      [data-ui-component="ai-chat-transcript"]
        [data-ui-part="compatibility-empty"]
        p
    ) {
    margin: 0;
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="review"]) {
    margin-top: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background: color-mix(in oklab, var(--muted) 40%, transparent);
    padding: 0.5rem 0.75rem;
  }

  :global(
      [data-ui-component="ai-chat-transcript"] [data-ui-part="review-title"]
    ) {
    margin: 0 0 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="review"] ul) {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="review"] li) {
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }

  :global(
      [data-ui-component="ai-chat-transcript"] [data-ui-part="review-label"]
    ) {
    color: var(--foreground);
    font-weight: 500;
  }
</style>
