<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Message from "../message/Message.svelte";
  import MessageBubble from "../message-bubble/MessageBubble.svelte";
  import MessageList from "../message-list/MessageList.svelte";
  import TokenizedText from "./TokenizedText.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Tokenized Text",
    component: TokenizedText,
    parameters: {
      docs: {
        description: {
          component:
            "Renders a text string with token patterns replaced by inline Badge components. Wrap any message body inside ChatMessageBubble to turn raw @mentions, #tags, or /commands into styled badges. When no tokens match or none are provided, the text renders as-is: so you can use ChatTokenizedText unconditionally on every message.",
        },
      },
    },
  });
</script>

<Story
  name="ASTRYX showcase"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/tokenized-text/astryx-showcase-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <MessageList style="max-width: 37.5rem">
      <Message sender="system">
        <MessageBubble>
          <TokenizedText
            text="@cindy filed #bug and #feat for the sprint"
            tokens={[
              { value: "@cindy", label: "@Cindy", variant: "secondary" },
              { value: "#bug", label: "#bug", variant: "destructive" },
              { value: "#feat", label: "#feature", variant: "outline" },
            ]}
          />
        </MessageBubble>
      </Message>
    </MessageList>
  {/snippet}
</Story>

<Story
  name="Basic"
  exportName="Basic"
  parameters={{
    docs: {
      description: {
        story:
          "A message with @mention tokens. Each matching pattern is replaced with its display name badge.",
      },
    },
    visualDelta: {
      images: ["/visual-baselines/ai/tokenized-text/basic-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <MessageList style="max-width: 37.5rem">
      <Message sender="system">
        <MessageBubble>
          <TokenizedText
            text="Assign @cindy and @alex as reviewers."
            tokens={[
              { value: "@cindy", label: "@Cindy", variant: "secondary" },
              { value: "@alex", label: "@Alex", variant: "secondary" },
            ]}
          />
        </MessageBubble>
      </Message>
    </MessageList>
  {/snippet}
</Story>

<Story
  name="Colors"
  exportName="Colors"
  parameters={{
    docs: {
      description: {
        story:
          "Tokens with different color variants to distinguish mentions, bugs, and features. Use variant colors to create a visual taxonomy: blue for people, red for bugs, green for features.",
      },
    },
    visualDelta: {
      images: ["/visual-baselines/ai/tokenized-text/colors-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <MessageList style="max-width: 37.5rem">
      <Message sender="system">
        <MessageBubble>
          <TokenizedText
            text="@cindy filed #bug and #feat for the sprint"
            tokens={[
              { value: "@cindy", label: "@Cindy", variant: "secondary" },
              { value: "#bug", label: "#bug", variant: "destructive" },
              { value: "#feat", label: "#feature", variant: "outline" },
            ]}
          />
        </MessageBubble>
      </Message>
    </MessageList>
  {/snippet}
</Story>

<style>
  :global([data-story="tokenized-line"]) {
    margin: 0;
    color: var(--foreground);
  }
</style>
