<script lang="ts">
  import ChatCommentArea from "./ChatCommentArea.svelte";
  import type { TranscriptController } from "./comments.svelte.js";
  import type { TranscriptBlock } from "./model.js";
  let {
    state,
    blocks,
  }: { state: TranscriptController; blocks: readonly TranscriptBlock[] } =
    $props();
  const threads = $derived(state.forBlocks(blocks));
</script>

{#if threads.length}
  <div class="ui-transcript-collapsed-comments">
    {#each threads as thread (thread.id)}<ChatCommentArea
        {state}
        threadId={thread.id}
        placement="summary"
      />{/each}
  </div>
{/if}

<style>
  .ui-transcript-collapsed-comments {
    display: grid;
    gap: 0.5rem;
    padding-block-start: 0.5rem;
  }
</style>
