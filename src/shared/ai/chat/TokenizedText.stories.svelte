<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Message from "./Message.svelte";
  import MessageBubble from "./MessageBubble.svelte";
  import MessageList from "./MessageList.svelte";
  import TokenizedText from "./TokenizedText.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Tokenized Text",
    component: TokenizedText,
    parameters: {
      docs: {
        description: {
          component:
            "Deterministic plain-text renderer that replaces serialized values with shared composer tokens.",
        },
      },
    },
  });
</script>

<Story name="ASTRYX showcase">
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

<Story name="Basic">
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

<Story name="Colors">
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
