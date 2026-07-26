<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Composer from "./Composer.svelte";
  import Layout from "./Layout.svelte";
  import MessageList from "./MessageList.svelte";
  import Message from "./Message.svelte";
  import MessageBubble from "./MessageBubble.svelte";
  import SystemMessage from "./SystemMessage.svelte";
  import TokenizedText from "./TokenizedText.svelte";

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

<script lang="ts">
  let showcaseValue = $state("");
  let panelValue = $state("");
</script>

<Story
  name="ASTRYX showcase"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/layout/astryx-showcase-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div data-story="chat-frame" data-size="showcase">
      <Layout>
        {#snippet composer()}
          <Composer
            bind:value={showcaseValue}
            placeholder="Ask something..."
            onSubmit={() => {
              showcaseValue = "";
            }}
          />
        {/snippet}
        <MessageList>
          <Message sender="user">
            <MessageBubble>
              <TokenizedText
                text="/review the changes in this file"
                tokens={[
                  {
                    value: "/review",
                    label: "/review",
                    variant: "secondary",
                  },
                ]}
              />
            </MessageBubble>
          </Message>
          <Message sender="assistant">
            <MessageBubble variant="ghost"
              >Reading the file now...</MessageBubble
            >
          </Message>
        </MessageList>
      </Layout>
    </div>
  {/snippet}
</Story>

<Story
  name="Panel view"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/layout/panel-view-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div data-story="chat-frame" data-size="panel">
      <Layout density="compact">
        {#snippet composer()}
          <Composer
            bind:value={panelValue}
            density="compact"
            placeholder="Ask something..."
            onSubmit={() => {
              panelValue = "";
            }}
          />
        {/snippet}
        <MessageList density="compact">
          <SystemMessage variant="divider">Today</SystemMessage>
          <Message sender="user" density="compact">
            <MessageBubble density="compact">
              Can you review the Button component and fix the focus ring?
            </MessageBubble>
          </Message>
          <Message sender="assistant" density="compact">
            <MessageBubble density="compact" variant="ghost">
              I&apos;ll check the Button component now. Found the issue — the
              border radius was hardcoded. Replaced with the theme token.
            </MessageBubble>
          </Message>
          <Message sender="user" density="compact">
            <MessageBubble density="compact">
              Nice, can you also check the Card component?
            </MessageBubble>
          </Message>
          <Message sender="assistant" density="compact">
            <MessageBubble density="compact" variant="ghost">
              Checking the component now. Found the issue — the border radius
              was hardcoded. Replaced with the theme token.
            </MessageBubble>
          </Message>
        </MessageList>
      </Layout>
    </div>
  {/snippet}
</Story>

<Story
  name="Empty conversation"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/layout/empty-conversation-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div data-story="chat-frame">
      <Layout isEmpty>
        {#snippet composer()}
          <Composer value="" onSubmit={() => {}} />
        {/snippet}
        <span>Unused while empty</span>
      </Layout>
    </div>
  {/snippet}
</Story>

<Story
  name="Browser scroll surface"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/chat/layout/browser-scroll-surface-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div data-story="chat-frame">
      <Layout>
        {#snippet composer()}
          <Composer value="" onSubmit={() => {}} />
        {/snippet}
        <MessageList latestMessageId="message-30">
          {#each Array.from({ length: 30 }) as _, index (index)}
            <Message sender={index % 2 === 0 ? "assistant" : "user"}>
              <MessageBubble>
                Message {index + 1}: enough content to exercise native wheel
                scrolling in the chat viewport.
              </MessageBubble>
            </Message>
          {/each}
        </MessageList>
      </Layout>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="chat-frame"]) {
    width: min(28.125rem, 90vw);
    height: 32rem;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 1rem;
  }

  :global([data-story="chat-frame"][data-size="panel"]) {
    height: 37.5rem;
  }
</style>
