<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Message from "./Message.svelte";
  import MessageBubble from "./MessageBubble.svelte";
  import MessageMetadata from "./MessageMetadata.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Message",
    component: Message,
    parameters: {
      docs: {
        description: {
          component:
            "Sender-aware message anatomy with optional avatar, name, grouped bubbles, and metadata.",
        },
      },
    },
  });
</script>

<Story name="Named assistant with avatar">
  {#snippet template()}
    <div data-story="message-frame">
      <Message sender="assistant" aria-label="Message from Mira">
        {#snippet avatar()}
          <span aria-hidden="true">M</span>
        {/snippet}
        {#snippet name()}Mira{/snippet}
        <MessageBubble group="first">I found two related notes.</MessageBubble>
        <MessageBubble group="last">
          Would you like a combined summary?
        </MessageBubble>
        {#snippet metadata()}
          <MessageMetadata timestamp="Now" />
        {/snippet}
      </Message>
    </div>
  {/snippet}
</Story>

<Story name="User message">
  {#snippet template()}
    <div data-story="message-frame">
      <Message sender="user" aria-label="Your message">
        <MessageBubble>Yes, combine them.</MessageBubble>
      </Message>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="message-frame"]) {
    width: min(34rem, 90vw);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 1rem;
  }
</style>
