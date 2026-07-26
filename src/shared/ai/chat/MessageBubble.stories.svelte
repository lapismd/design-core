<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MessageBubble from "./MessageBubble.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Message Bubble",
    component: MessageBubble,
    parameters: {
      docs: {
        description: {
          component:
            "Filled or ghost message content with sender, density, and grouped-corner variants.",
        },
      },
    },
  });
</script>

<Story name="Filled sender variants">
  {#snippet template()}
    <div data-story="bubble-stack">
      <MessageBubble sender="assistant">Assistant response</MessageBubble>
      <MessageBubble sender="user">User response</MessageBubble>
    </div>
  {/snippet}
</Story>

<Story name="Grouped and ghost">
  {#snippet template()}
    <div data-story="bubble-stack">
      <MessageBubble sender="assistant" group="first">
        First grouped bubble
      </MessageBubble>
      <MessageBubble sender="assistant" group="last">
        Last grouped bubble
      </MessageBubble>
      <MessageBubble sender="assistant" variant="ghost">
        Rich consumer content can render without a surface.
      </MessageBubble>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="bubble-stack"]) {
    display: flex;
    width: min(28rem, 90vw);
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 1rem;
  }

  :global(
      [data-story="bubble-stack"]
        [data-ui-component="ai-chat-message-bubble"][data-sender="user"]
    ) {
    align-self: flex-end;
  }
</style>
