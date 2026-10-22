<script lang="ts">
  import { untrack } from "svelte";
  import { Button } from "../../shadcn/button/index.js";
  import ChatCommentBatch from "./ChatCommentBatch.svelte";
  import ChatCommentArea from "./ChatCommentArea.svelte";
  import { TranscriptController } from "./comments.svelte.js";
  import type { TranscriptBlock, TranscriptProps } from "./model.js";
  let {
    quote = "A **captured** quote.",
    sourceKind = "markdown",
    inline = false,
  }: {
    quote?: string;
    sourceKind?: "markdown" | "code";
    inline?: boolean;
  } = $props();
  const block: TranscriptBlock = untrack(() => ({
    id: "note/body",
    revision: "1",
    kind: sourceKind,
    label: "Original note",
    text: quote,
  }));
  const transcriptProps: TranscriptProps = {
    items: [],
    externalBlocks: [block],
    author: { id: "you", name: "You" },
  };
  const state = new TranscriptController(() => transcriptProps);
  function populate() {
    state.open(block, { from: 0, to: block.text.length }, "Keep this draft");
  }
  populate();
</script>

<Button onclick={() => (state.threads = [])}>Switch conversation</Button>
<Button onclick={populate}>Restore draft</Button>
{#if inline}
  {#each state.threads as thread (thread.id)}
    <ChatCommentArea {state} threadId={thread.id} />
  {/each}
{:else}<ChatCommentBatch {state} />{/if}
