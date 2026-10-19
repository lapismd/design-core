<script lang="ts">
  import Transcript from "./Transcript.svelte";
  import type { TranscriptItem } from "./model.js";
  let { view = "document" }: { view?: "document" | "classic" } = $props();
  let busy = $state(false);
  let expanded = $state(false);
  let items = $state<TranscriptItem[]>(
    Array.from({ length: 24 }, (_, i) => ({
      id: `message-${i}`,
      kind: "message",
      role: i % 2 ? "assistant" : "user",
      label: `Message ${i + 1}`,
      blocks: [
        {
          id: `message-${i}/body`,
          revision: "1",
          kind: "markdown",
          label: "Captured message",
          text:
            `## Revision ${i + 1}\n\nReview the saved conversation without losing your place.\n\n` +
            "Captured context stays unchanged while the agent continues working. ".repeat(
              6,
            ),
        },
      ],
    })),
  );
  function append() {
    const id = `message-${items.length}`;
    items = [
      ...items,
      {
        id,
        kind: "message",
        role: "assistant",
        label: "Latest update",
        blocks: [
          {
            id: `${id}/body`,
            revision: "1",
            kind: "markdown",
            label: "Latest update",
            text:
              "Latest captured response\n\n" +
              "Measured content can grow after rendering. ".repeat(18),
          },
        ],
      },
    ];
  }
</script>

<div class="controls">
  <button onclick={() => (busy = !busy)}
    >{busy ? "Finish session" : "Run session"}</button
  >
  <button onclick={append}>Append response</button>
  <button onclick={() => (expanded = !expanded)}>Resize captured output</button>
</div>
<div class="frame">
  <Transcript
    {items}
    {view}
    {busy}
    scrollButton
    navigation={false}
    classicComposerPlacement="fixed"
    canComment={false}
  >
    {#snippet afterItems()}<div style:height={expanded ? "12rem" : "1rem"}>
        Captured output
      </div>{/snippet}
    {#snippet composer()}<textarea
        aria-label="Message"
        placeholder="Write a message"
      ></textarea>{/snippet}
    {#snippet footer()}<div class="footer">Session controls</div>{/snippet}
  </Transcript>
</div>

<style>
  .frame {
    height: 32rem;
    width: min(42rem, 100%);
  }
  .controls {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  textarea {
    box-sizing: border-box;
    width: 100%;
    min-height: 4rem;
    padding: 0.5rem;
    background: var(--background);
    color: var(--foreground);
  }
  .footer {
    padding: 0.5rem;
  }
</style>
