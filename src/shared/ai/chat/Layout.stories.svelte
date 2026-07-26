<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Layout from "./Layout.svelte";
  import MessageList from "./MessageList.svelte";
  import Message from "./Message.svelte";
  import MessageBubble from "./MessageBubble.svelte";
  import MessageMetadata from "./MessageMetadata.svelte";
  import SystemMessage from "./SystemMessage.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Layout",
    component: Layout,
    parameters: {
      docs: {
        description: {
          component:
            "Scrollable chat shell with a sticky composer dock, empty state, and new-message recovery.",
        },
      },
    },
  });
</script>

<Story name="Complete conversation">
  {#snippet template()}
    <div data-story="chat-frame">
      <Layout>
        {#snippet composer()}
          <div data-story="composer">Ask the assistant…</div>
        {/snippet}
        <MessageList>
          <SystemMessage variant="divider">Today</SystemMessage>
          <Message sender="assistant">
            <MessageBubble>Hello. How can I help?</MessageBubble>
          </Message>
          <Message sender="user">
            <MessageBubble>Summarize the release notes.</MessageBubble>
            {#snippet metadata()}
              <MessageMetadata timestamp="10:42" status="read" />
            {/snippet}
          </Message>
          <Message sender="assistant">
            <MessageBubble variant="ghost">
              The release focuses on faster navigation and a smaller application
              bundle.
            </MessageBubble>
          </Message>
        </MessageList>
      </Layout>
    </div>
  {/snippet}
</Story>

<Story name="Empty conversation">
  {#snippet template()}
    <div data-story="chat-frame">
      <Layout isEmpty>
        {#snippet composer()}
          <div data-story="composer">Ask the assistant…</div>
        {/snippet}
        <span>Unused while empty</span>
      </Layout>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="chat-frame"]) {
    width: min(30rem, 90vw);
    height: 28rem;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 1rem;
  }

  :global([data-story="composer"]) {
    min-height: 3.5rem;
    border: 1px solid var(--border);
    border-radius: 1rem;
    background: var(--background);
    padding: 1rem;
    color: var(--muted-foreground);
    box-shadow: var(--shadow-sm);
  }
</style>
