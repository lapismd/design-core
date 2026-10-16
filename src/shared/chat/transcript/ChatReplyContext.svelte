<script lang="ts">
  import ChatCommentArea from "./ChatCommentArea.svelte";
  import type { TranscriptController } from "./comments.svelte.js";
  import type { TranscriptItem } from "./model.js";
  let { item, state }: { item: TranscriptItem; state: TranscriptController } =
    $props();
</script>

{#if item.replyContext}
  <ChatCommentArea
    {state}
    threadId={item.replyContext.threadId}
    commentIds={item.replyContext.commentIds}
    placement="reply"
  />
{/if}
