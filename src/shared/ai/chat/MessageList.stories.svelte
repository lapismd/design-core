<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import MessageList from "./MessageList.svelte";
  import Message from "./Message.svelte";
  import MessageBubble from "./MessageBubble.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Message List",
    component: MessageList,
    parameters: {
      docs: {
        description: {
          component:
            "Accessible live message log with density, empty, streaming, and deduplicated top-pagination states.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let olderLoaded = $state(false);
</script>

<Story
  name="Loads older messages"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Load older messages" }),
    );
    await expect(canvas.getByText("Earlier context")).toBeVisible();
  }}
>
  {#snippet template()}
    <div data-story="message-list-frame">
      <MessageList
        scrollToTopAction={async () => {
          olderLoaded = true;
        }}
      >
        {#if olderLoaded}
          <Message sender="assistant">
            <MessageBubble>Earlier context</MessageBubble>
          </Message>
        {/if}
        <Message sender="user">
          <MessageBubble>Current message</MessageBubble>
        </Message>
      </MessageList>
    </div>
  {/snippet}
</Story>

<Story name="Empty live log">
  {#snippet template()}
    <div data-story="message-list-frame">
      <MessageList isEmpty isStreaming={false}>
        <span>Unused while empty</span>
      </MessageList>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="message-list-frame"]) {
    width: min(30rem, 90vw);
    min-height: 18rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 1rem;
  }
</style>
