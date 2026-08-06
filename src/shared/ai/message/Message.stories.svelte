<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Message from "./Message.svelte";
  import MessageBubble from "../message-bubble/MessageBubble.svelte";
  import MessageList from "../message-list/MessageList.svelte";
  import MessageMetadata from "../message-metadata/MessageMetadata.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Message",
    component: Message,
    parameters: {
      docs: {
        description: {
          component:
            "Sender context wrapper: handles avatar, name, metadata, and alignment based on sender role."}}}});
</script>

<Story
  name="ASTRYX showcase"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/message/astryx-showcase-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right"
    }}}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <MessageList style="max-width: 37.5rem">
      <Message sender="user">
        <MessageBubble group="first">
          I just pushed the refactored auth module.
        </MessageBubble>
        <MessageBubble group="last">
          {#snippet metadata()}
            <MessageMetadata timestamp="14:30" status="read" />
          {/snippet}
          Can you review the token validation changes?
        </MessageBubble>
      </Message>
      <Message sender="assistant">
        <MessageBubble variant="ghost">
          {#snippet metadata()}
            <MessageMetadata timestamp="14:31">
              {#snippet footer()}Claude Opus 4.6{/snippet}
            </MessageMetadata>
          {/snippet}
          Looks good — the refresh token rotation is solid and the error handling
          covers all the edge cases. Ship it.
        </MessageBubble>
      </Message>
    </MessageList>
  {/snippet}
</Story>

<Story
  name="Avatar and name"
  exportName="AvatarAndName"
  parameters={{
    docs: {
      description: {
        story:
          "Messages with avatars and sender names. Place the name on the bubble when using bubbles, or on the message wrapper for raw content."}},
    visualDelta: {
      images: [
        "/visual-baselines/ai/message/avatar-and-name-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right"
    }}}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <MessageList style="max-width: 31.25rem">
      <Message sender="assistant">
        {#snippet avatar()}
          <span data-story-avatar role="img" aria-label="Agent">A</span>
        {/snippet}
        <MessageBubble>
          {#snippet name()}Agent{/snippet}
          {#snippet metadata()}<MessageMetadata timestamp="10:15" />{/snippet}
          I reviewed the pull request. The changes look solid — clean code and good
          test coverage.
        </MessageBubble>
      </Message>
      <Message sender="user">
        <MessageBubble>
          {#snippet metadata()}
            <MessageMetadata timestamp="10:16" status="read" />
          {/snippet}
          Thanks! Merging it now.
        </MessageBubble>
      </Message>
      <Message sender="assistant">
        {#snippet avatar()}
          <span data-story-avatar role="img" aria-label="Agent">A</span>
        {/snippet}
        <MessageBubble>
          {#snippet name()}Agent{/snippet}
          {#snippet metadata()}<MessageMetadata timestamp="10:17" />{/snippet}
          I can run the deployment pipeline once it lands. Just let me know.
        </MessageBubble>
      </Message>
    </MessageList>
  {/snippet}
</Story>

<Story
  name="Ghost"
  exportName="Ghost"
  parameters={{
    docs: {
      description: {
        story:
          "Ghost variant for messages without visible bubble boundaries. Keeps padding for alignment but renders a transparent background, useful for AI-style responses."}},
    visualDelta: {
      images: ["/visual-baselines/ai/message/ghost-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right"
    }}}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <MessageList style="max-width: 31.25rem">
      <Message sender="assistant">
        <MessageBubble variant="ghost">
          {#snippet metadata()}
            <MessageMetadata timestamp="9:45">
              {#snippet footer()}Claude Opus 4.6{/snippet}
            </MessageMetadata>
          {/snippet}
          Here is an analysis of your production metrics from last week. Traffic
          peaked at 12,400 requests per second on Wednesday, with a p99 latency of
          45ms. Error rate stayed below 0.1% across all endpoints.
        </MessageBubble>
      </Message>
      <Message sender="user">
        <MessageBubble>
          That looks great. Can you compare it to the week before?
        </MessageBubble>
      </Message>
      <Message sender="assistant">
        <MessageBubble variant="ghost">
          {#snippet metadata()}
            <MessageMetadata timestamp="9:46">
              {#snippet footer()}Claude Opus 4.6{/snippet}
            </MessageMetadata>
          {/snippet}
          Compared to the previous week, traffic is up 8% and latency improved by
          3ms. The deployment on Tuesday seems to have helped.
        </MessageBubble>
      </Message>
    </MessageList>
  {/snippet}
</Story>

<Story
  name="Multi-bubble"
  exportName="MultiBubble"
  parameters={{
    docs: {
      description: {
        story:
          "Grouped bubbles using the group prop for corner radius reduction. Use first, middle, and last to visually connect related bubbles from the same sender."}},
    visualDelta: {
      images: [
        "/visual-baselines/ai/message/multi-bubble-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right"
    }}}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <MessageList style="max-width: 31.25rem">
      <Message sender="user">
        <MessageBubble group="first">
          I have a couple of questions about the new API.
        </MessageBubble>
        <MessageBubble group="middle">
          First, how should we handle pagination?
        </MessageBubble>
        <MessageBubble group="last">
          {#snippet metadata()}
            <MessageMetadata timestamp="11:00" status="delivered" />
          {/snippet}
          And second, what's the rate limit?
        </MessageBubble>
      </Message>
      <Message sender="assistant">
        {#snippet avatar()}
          <span data-story-avatar role="img" aria-label="Agent">A</span>
        {/snippet}
        <MessageBubble group="first">
          {#snippet name()}Agent{/snippet}
          Great questions! For pagination, use cursor-based with a limit parameter.
          The response includes a nextCursor field.
        </MessageBubble>
        <MessageBubble group="last">
          {#snippet metadata()}<MessageMetadata timestamp="11:01" />{/snippet}
          Rate limit is 100 requests per minute per API key. You'll get a 429 response
          with a Retry-After header if you exceed it.
        </MessageBubble>
      </Message>
    </MessageList>
  {/snippet}
</Story>

<style>
  :global([data-story-avatar]) {
    display: grid;
    width: 2.25rem;
    height: 2.25rem;
    overflow: hidden;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: var(--muted);
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
</style>
