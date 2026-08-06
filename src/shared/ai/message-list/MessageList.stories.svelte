<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Message from "../message/Message.svelte";
  import MessageBubble from "../message-bubble/MessageBubble.svelte";
  import MessageList from "./MessageList.svelte";
  import MessageMetadata from "../message-metadata/MessageMetadata.svelte";
  import SystemMessage from "../system-message/SystemMessage.svelte";

  const REDUCER_CODE = `const [state, dispatch] = useReducer(
  (state, action) => ({
    ...state,
    [action.field]: action.value}),
  { name: '', email: '' }
);`;

  const { Story } = defineMeta({
    title: "AI/Chat/Message List",
    component: MessageList,
    parameters: {
      docs: {
        description: {
          component:
            'Presentational message container with density context and infinite scroll support. Provides role="log" with aria-live="polite" for accessibility. A flex spacer pushes messages to the bottom when the list isn\'t full.',
        },
      },
    },
  });
</script>

<script lang="ts">
  let olderLoaded = $state(false);
</script>

<Story
  name="ASTRYX showcase"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/message-list/astryx-showcase-chromium.png",
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
    <div data-story="message-list-surface" style="max-width: 37.5rem">
      <MessageList density="balanced">
        <SystemMessage variant="divider">March 15, 2026</SystemMessage>
        <Message sender="user">
          <MessageBubble>
            {#snippet metadata()}
              <MessageMetadata timestamp="14:30" status="read" />
            {/snippet}
            How should I structure a monorepo?
          </MessageBubble>
        </Message>
        <Message sender="assistant">
          <MessageBubble>
            {#snippet metadata()}<MessageMetadata timestamp="14:30" />{/snippet}
            Use workspaces with a shared packages directory. Keep each package focused
            on a single concern.
          </MessageBubble>
        </Message>
        <Message sender="user">
          <MessageBubble>
            {#snippet metadata()}
              <MessageMetadata timestamp="14:31" status="delivered" />
            {/snippet}
            Should I use Yarn or pnpm for that?
          </MessageBubble>
        </Message>
      </MessageList>
    </div>
  {/snippet}
</Story>

<Story
  name="Density"
  exportName="Density"
  parameters={{
    docs: {
      description: {
        story:
          "Side-by-side comparison of compact, balanced, and spacious densities. Use compact in sidebars or panels, balanced for most full-page chat, and spacious for long-form reading. Use gap when row spacing needs to differ from density.",
      },
    },
    visualDelta: {
      images: ["/visual-baselines/ai/message-list/density-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="reference-sections" style="max-width: 31.25rem">
      <section>
        <p>Compact</p>
        <MessageList density="compact">
          <Message sender="user">
            <MessageBubble>How does density work?</MessageBubble>
          </Message>
          <Message sender="assistant">
            {#snippet avatar()}
              <span data-story-avatar role="img" aria-label="Agent">A</span>
            {/snippet}
            <MessageBubble>
              Density provides default spacing at every level — message gap,
              bubble padding, and gap between child elements. Use gap to tune
              row spacing independently.
            </MessageBubble>
          </Message>
        </MessageList>
      </section>
      <section>
        <p>Balanced</p>
        <MessageList density="balanced">
          <Message sender="user">
            <MessageBubble>How does density work?</MessageBubble>
          </Message>
          <Message sender="assistant">
            {#snippet avatar()}
              <span data-story-avatar role="img" aria-label="Agent">A</span>
            {/snippet}
            <MessageBubble>
              Density provides default spacing at every level — message gap,
              bubble padding, and gap between child elements. Use gap to tune
              row spacing independently.
            </MessageBubble>
          </Message>
        </MessageList>
      </section>
      <section>
        <p>Spacious</p>
        <MessageList density="spacious">
          <Message sender="user">
            <MessageBubble>How does density work?</MessageBubble>
          </Message>
          <Message sender="assistant">
            {#snippet avatar()}
              <span data-story-avatar role="img" aria-label="Agent">A</span>
            {/snippet}
            <MessageBubble>
              Density provides default spacing at every level — message gap,
              bubble padding, and gap between child elements. Use gap to tune
              row spacing independently.
            </MessageBubble>
          </Message>
        </MessageList>
      </section>
    </div>
  {/snippet}
</Story>

<Story
  name="Full featured"
  exportName="FullFeatured"
  parameters={{
    docs: {
      description: {
        story:
          "Conversation showcasing system messages, multi-bubble grouping, markdown, code blocks, and metadata. Combines date dividers, ghost bubbles, grouped messages, and rich content in a single example.",
      },
    },
    visualDelta: {
      images: ["/visual-baselines/ai/message-list/full-featured-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="message-list-surface" style="max-width: 31.25rem">
      <MessageList>
        <SystemMessage variant="divider">Today</SystemMessage>
        <Message sender="user">
          <span data-story="file-tokens">
            <span>useReducer.ts</span>
            <span>formState.ts</span>
          </span>
          <MessageBubble>
            {#snippet metadata()}
              <MessageMetadata timestamp="14:30" status="read" />
            {/snippet}
            Can you review these files?
          </MessageBubble>
        </Message>
        <Message sender="assistant">
          {#snippet avatar()}
            <span data-story-avatar role="img" aria-label="Agent">A</span>
          {/snippet}
          <MessageBubble group="first">
            <p>
              Sure! Here's the key pattern from
              <strong>useReducer.ts</strong>:
            </p>
          </MessageBubble>
          <MessageBubble group="last">
            <p>
              The reducer is <strong>pure and easy to test</strong> — pass in state
              and action, assert on the output.
            </p>
          </MessageBubble>
          <MessageBubble variant="ghost" group="middle">
            {#snippet metadata()}<MessageMetadata timestamp="14:30" />{/snippet}
            <pre data-story="code"><code>{REDUCER_CODE}</code></pre>
          </MessageBubble>
        </Message>
        <SystemMessage>Agent shared a code snippet</SystemMessage>
        <Message sender="user">
          <MessageBubble>
            {#snippet metadata()}
              <MessageMetadata timestamp="14:31" status="delivered" />
            {/snippet}
            That's clean, thanks!
          </MessageBubble>
        </Message>
      </MessageList>
    </div>
  {/snippet}
</Story>

<Story
  name="Loads older messages"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Load older messages" }),
    );
    await expect(canvas.getByText("Earlier context")).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/message-list/loads-older-messages-chromium.png",
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
    <div data-story="message-list-surface" style="max-width: 30rem">
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

<Story
  name="Empty live log"
  parameters={{
    visualDelta: {
      images: ["/visual-baselines/ai/message-list/empty-live-log-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="message-list-surface" style="max-width: 30rem">
      <MessageList isEmpty isStreaming={false}>
        <span>Unused while empty</span>
      </MessageList>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="message-list-surface"]) {
    display: flex;
    width: 100%;
    min-height: 24rem;
  }

  :global([data-story="reference-sections"]) {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 1rem;
  }

  :global([data-story="reference-sections"] section) {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 1rem;
  }

  :global([data-story="reference-sections"] section:last-child) {
    border-bottom: 0;
  }

  :global([data-story="reference-sections"] p),
  :global([data-ui-component="ai-chat-message-bubble"] p) {
    margin: 0;
  }

  :global([data-story="reference-sections"] > section > p) {
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }

  :global([data-story-avatar]) {
    display: grid;
    width: 2.25rem;
    height: 2.25rem;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: var(--muted);
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }

  :global([data-story="file-tokens"]) {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  :global([data-story="file-tokens"] span) {
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--secondary);
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
  }

  :global([data-story="code"]) {
    max-width: 100%;
    overflow: auto;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background: var(--muted);
    padding: 0.75rem;
    font-size: 0.75rem;
    white-space: pre;
  }
</style>
