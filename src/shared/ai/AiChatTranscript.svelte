<script lang="ts">
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import { ScrollArea } from "@stevejuma/ui/shadcn/scroll-area";
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
</script>

<div data-ui-component="ai-chat-transcript" data-ui-part="root">
  <div data-ui-part="scroll">
    <ScrollArea>
      <div data-ui-component="ai-chat-transcript" data-ui-part="list">
        {#if loading}
          <p data-ui-part="status">Loading conversation…</p>
        {:else if error}
          <div data-ui-part="error">{error}</div>
        {:else if messages.length === 0}
          <div data-ui-part="empty">
            <SparklesIcon />
            <p>{emptyHint}</p>
          </div>
        {/if}

        {#each messages as message (message.id)}
          <div data-ui-part="message" data-role={message.role}>{message.text}</div>
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
      </div>
    </ScrollArea>
  </div>
</div>

<style>
  :global([data-ui-component="ai-chat-transcript"][data-ui-part="root"]) {
    display: flex;
    min-height: 0;
    flex: 1 1 auto;
    flex-direction: column;
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="scroll"]) {
    display: flex;
    min-height: 0;
    flex: 1 1 auto;
    flex-direction: column;
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="scroll"] > [data-ui-component="scroll-area"]) {
    min-height: 0;
    flex: 1 1 auto;
  }

  :global([data-ui-component="ai-chat-transcript"][data-ui-part="list"]) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="status"]) {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="error"]) {
    border: 1px solid color-mix(in oklab, var(--destructive) 40%, transparent);
    border-radius: 0.5rem;
    background: color-mix(in oklab, var(--destructive) 10%, transparent);
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: var(--destructive);
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="empty"]) {
    display: flex;
    min-height: 7rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-align: center;
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="empty"] svg) {
    width: 1rem;
    height: 1rem;
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="message"]) {
    max-width: 85%;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    white-space: pre-wrap;
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="message"][data-role="user"]) {
    margin-left: auto;
    background: var(--primary);
    color: var(--primary-foreground);
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="message"][data-role="assistant"]) {
    margin-right: auto;
    background: var(--muted);
    color: var(--foreground);
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="message"][data-role="system"]) {
    margin-inline: auto;
    max-width: 92%;
    background: var(--muted);
    color: var(--muted-foreground);
    text-align: center;
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="review"]) {
    margin-top: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background: color-mix(in oklab, var(--muted) 40%, transparent);
    padding: 0.5rem 0.75rem;
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="review-title"]) {
    margin-bottom: 0.25rem;
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
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }

  :global([data-ui-component="ai-chat-transcript"] [data-ui-part="review-label"]) {
    font-weight: 500;
    color: var(--foreground);
  }
</style>
