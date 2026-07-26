<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Message from "./Message.svelte";
  import MessageBubble from "./MessageBubble.svelte";
  import MessageList from "./MessageList.svelte";
  import MessageMetadata from "./MessageMetadata.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Message Bubble",
    component: MessageBubble,
    parameters: {
      docs: {
        description: {
          component:
            "Styled chat content with sender-aware filled and ghost variants, density, sibling name/metadata slots, and grouped corners. The stories reproduce ASTRYX’s documented fixtures.",
        },
      },
    },
  });
</script>

<Story name="ASTRYX showcase">
  {#snippet template()}
    <MessageList style="max-width: 37.5rem">
      <Message sender="user">
        <MessageBubble group="first">
          I just pushed the latest changes to the feature branch.
        </MessageBubble>
        <MessageBubble group="last">
          {#snippet metadata()}
            <MessageMetadata timestamp="9:15" status="read" />
          {/snippet}
          Can you review when you get a chance?
        </MessageBubble>
      </Message>
      <Message sender="assistant">
        <MessageBubble variant="ghost">
          {#snippet metadata()}<MessageMetadata timestamp="9:16" />{/snippet}
          The changes look great. Ship it!
        </MessageBubble>
      </Message>
    </MessageList>
  {/snippet}
</Story>

<Story name="Density">
  {#snippet template()}
    <div data-story="reference-sections" style="max-width: 25rem">
      <section>
        <p>Compact</p>
        <MessageList density="compact">
          <Message sender="assistant">
            <MessageBubble>The build completed in 4.2 seconds.</MessageBubble>
          </Message>
          <Message sender="user">
            <MessageBubble>Ship it to staging.</MessageBubble>
          </Message>
        </MessageList>
      </section>
      <section>
        <p>Balanced</p>
        <MessageList density="balanced">
          <Message sender="assistant">
            <MessageBubble>The build completed in 4.2 seconds.</MessageBubble>
          </Message>
          <Message sender="user">
            <MessageBubble>Ship it to staging.</MessageBubble>
          </Message>
        </MessageList>
      </section>
      <section>
        <p>Spacious</p>
        <MessageList density="spacious">
          <Message sender="assistant">
            <MessageBubble>The build completed in 4.2 seconds.</MessageBubble>
          </Message>
          <Message sender="user">
            <MessageBubble>Ship it to staging.</MessageBubble>
          </Message>
        </MessageList>
      </section>
    </div>
  {/snippet}
</Story>

<Story name="Grouping">
  {#snippet template()}
    <MessageList style="max-width: 31.25rem">
      <Message sender="assistant">
        {#snippet avatar()}
          <span data-story-avatar role="img" aria-label="Agent">A</span>
        {/snippet}
        <MessageBubble group="first">
          {#snippet name()}Agent{/snippet}
          I reviewed the three files you shared.
        </MessageBubble>
        <MessageBubble group="middle">
          The data model looks solid, but the API handler has a race condition
          on concurrent writes.
        </MessageBubble>
        <MessageBubble group="last">
          {#snippet metadata()}<MessageMetadata timestamp="10:45" />{/snippet}
          I can draft a fix if you want.
        </MessageBubble>
      </Message>
      <Message sender="user">
        <MessageBubble group="first">Yes please!</MessageBubble>
        <MessageBubble group="last">
          {#snippet metadata()}
            <MessageMetadata timestamp="10:46" status="delivered" />
          {/snippet}
          Also add a test for the concurrent case.
        </MessageBubble>
      </Message>
    </MessageList>
  {/snippet}
</Story>

<Story name="Metadata">
  {#snippet template()}
    <MessageList style="max-width: 31.25rem">
      <Message sender="assistant">
        {#snippet avatar()}
          <span data-story-avatar role="img" aria-label="Agent">A</span>
        {/snippet}
        <MessageBubble>
          {#snippet name()}Agent{/snippet}
          {#snippet metadata()}
            <MessageMetadata timestamp="9:15">
              {#snippet footer()}Copy · Claude Opus 4.6{/snippet}
            </MessageMetadata>
          {/snippet}
          Your deployment finished successfully. All 14 checks passed.
        </MessageBubble>
      </Message>
      <Message sender="user">
        <MessageBubble>
          {#snippet metadata()}
            <MessageMetadata timestamp="9:16" status="read" />
          {/snippet}
          Great, can you send me the production URL?
        </MessageBubble>
      </Message>
    </MessageList>
  {/snippet}
</Story>

<Story name="Variants">
  {#snippet template()}
    <div data-story="reference-sections" style="max-width: 31.25rem">
      <section>
        <p>Filled — sender-colored background (default)</p>
        <MessageList>
          <Message sender="user">
            <MessageBubble>
              Can you summarize the latest deployment logs?
            </MessageBubble>
          </Message>
        </MessageList>
      </section>
      <section>
        <p>Ghost — transparent background, keeps alignment padding</p>
        <MessageList>
          <Message sender="assistant">
            <MessageBubble variant="ghost">
              The last deploy completed at 2:41 PM with zero errors across all
              three regions.
            </MessageBubble>
          </Message>
        </MessageList>
      </section>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="reference-sections"]) {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 1.25rem;
  }

  :global([data-story="reference-sections"] section) {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  :global([data-story="reference-sections"] p) {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.75rem;
    line-height: 1rem;
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
</style>
