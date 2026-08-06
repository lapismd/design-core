<script module lang="ts">
  import CopyIcon from "@lucide/svelte/icons/copy";
  import RedoIcon from "@lucide/svelte/icons/redo-2";
  import ThumbsDownIcon from "@lucide/svelte/icons/thumbs-down";
  import ThumbsUpIcon from "@lucide/svelte/icons/thumbs-up";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import Message from "../message/Message.svelte";
  import MessageBubble from "../message-bubble/MessageBubble.svelte";
  import MessageList from "../message-list/MessageList.svelte";
  import MessageMetadata from "./MessageMetadata.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Message Metadata",
    component: MessageMetadata,
    parameters: {
      docs: {
        description: {
          component:
            "Composable metadata row for chat messages. Renders timestamp, footer content, and delivery status in a single row. Direction reverses for user sender. Renders nothing if all props are empty."}}}});
</script>

<Story
  name="ASTRYX showcase"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/message-metadata/astryx-showcase-chromium.png",
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
      <Message sender="assistant">
        <MessageBubble>
          {#snippet metadata()}
            <MessageMetadata timestamp="14:30" status="error">
              {#snippet footer()}
                <Button variant="ghost" size="icon-sm" aria-label="Retry">
                  <RedoIcon aria-hidden="true" />
                </Button>
              {/snippet}
            </MessageMetadata>
          {/snippet}
          Sorry, something went wrong on my end.
        </MessageBubble>
      </Message>
      <Message sender="user">
        <MessageBubble>
          {#snippet metadata()}
            <MessageMetadata timestamp="14:31" status="read" />
          {/snippet}
          No worries — try again with just the last 24 hours of logs.
        </MessageBubble>
      </Message>
      <Message sender="assistant">
        <MessageBubble>
          {#snippet metadata()}
            <MessageMetadata timestamp="14:32">
              {#snippet footer()}
                <span data-story="metadata-actions">
                  <Button variant="ghost" size="icon-sm" aria-label="Copy">
                    <CopyIcon aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Retry">
                    <RedoIcon aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Good response"
                  >
                    <ThumbsUpIcon aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Bad response"
                  >
                    <ThumbsDownIcon aria-hidden="true" />
                  </Button>
                  <span>Claude Opus 4.6</span>
                </span>
              {/snippet}
            </MessageMetadata>
          {/snippet}
          The canary at 11:42 AM caused a memory spike. Rolled back at 11:58 AM.
        </MessageBubble>
      </Message>
    </MessageList>
  {/snippet}
</Story>

<Story
  name="Footer actions"
  exportName="FooterActions"
  parameters={{
    docs: {
      description: {
        story:
          "Assistant message with footer actions: copy, retry, thumbs up/down, and model label. Use for AI responses that need feedback or utility controls."}},
    visualDelta: {
      images: [
        "/visual-baselines/ai/message-metadata/footer-actions-chromium.png",
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
        <MessageBubble>
          {#snippet metadata()}
            <MessageMetadata timestamp="9:41" status="read" />
          {/snippet}
          Summarize the Q1 revenue report.
        </MessageBubble>
      </Message>
      <Message sender="assistant">
        <MessageBubble>
          {#snippet metadata()}
            <MessageMetadata timestamp="9:42">
              {#snippet footer()}
                <span data-story="metadata-actions">
                  <Button variant="ghost" size="icon-sm" aria-label="Copy">
                    <CopyIcon aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Retry">
                    <RedoIcon aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Good response"
                  >
                    <ThumbsUpIcon aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Bad response"
                  >
                    <ThumbsDownIcon aria-hidden="true" />
                  </Button>
                  <span>GPT-4o</span>
                </span>
              {/snippet}
            </MessageMetadata>
          {/snippet}
          Q1 revenue reached $2.4B, up 18% year-over-year. Enterprise subscriptions
          drove 62% of the growth, while ad revenue held steady at $890M.
        </MessageBubble>
      </Message>
    </MessageList>
  {/snippet}
</Story>

<Story
  name="Status"
  exportName="Status"
  parameters={{
    docs: {
      description: {
        story:
          "All 5 delivery statuses (sending, sent, delivered, read, and error), each with a timestamp. Use to show message delivery progress or surface failures."}},
    visualDelta: {
      images: [
        "/visual-baselines/ai/message-metadata/status-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right"
    }}}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <MessageList style="max-width: 25rem">
      <Message sender="user">
        <MessageBubble>
          {#snippet metadata()}
            <MessageMetadata timestamp="10:15" status="sending" />
          {/snippet}
          Deploying the update now…
        </MessageBubble>
      </Message>
      <Message sender="user">
        <MessageBubble>
          {#snippet metadata()}
            <MessageMetadata timestamp="10:15" status="sent" />
          {/snippet}
          Config pushed to staging.
        </MessageBubble>
      </Message>
      <Message sender="user">
        <MessageBubble>
          {#snippet metadata()}
            <MessageMetadata timestamp="10:15" status="delivered" />
          {/snippet}
          Verified on the staging cluster.
        </MessageBubble>
      </Message>
      <Message sender="user">
        <MessageBubble>
          {#snippet metadata()}
            <MessageMetadata timestamp="10:15" status="read" />
          {/snippet}
          Looks good — promoting to prod.
        </MessageBubble>
      </Message>
      <Message sender="user">
        <MessageBubble>
          {#snippet metadata()}
            <MessageMetadata timestamp="10:15" status="error" />
          {/snippet}
          Rollback triggered, checking logs.
        </MessageBubble>
      </Message>
    </MessageList>
  {/snippet}
</Story>

<Story
  name="Timestamps"
  exportName="Timestamps"
  parameters={{
    docs: {
      description: {
        story:
          "Timestamp-only metadata on user and assistant messages. Supports absolute time and relative formats via Timestamp."}},
    visualDelta: {
      images: [
        "/visual-baselines/ai/message-metadata/timestamps-chromium.png",
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
        <MessageBubble>
          {#snippet metadata()}<MessageMetadata timestamp="14:30" />{/snippet}
          Thanks — any blockers I should know about?
        </MessageBubble>
      </Message>
      <Message sender="assistant">
        <MessageBubble>
          {#snippet metadata()}
            <MessageMetadata timestamp="2 months ago" />
          {/snippet}
          Relative timestamps work too — helpful for older messages where the exact
          time matters less than recency.
        </MessageBubble>
      </Message>
    </MessageList>
  {/snippet}
</Story>

<style>
  :global([data-story="metadata-actions"]) {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  :global([data-story="metadata-actions"] [data-ui-component="button"]) {
    width: 1.5rem;
    height: 1.5rem;
  }

  :global([data-story="metadata-actions"] svg) {
    width: 0.75rem;
    height: 0.75rem;
  }
</style>
