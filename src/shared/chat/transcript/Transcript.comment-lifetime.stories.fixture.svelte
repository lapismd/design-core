<script lang="ts">
  import { Button } from "../../shadcn/button/index.js";
  import ChatCommentBatch from "./ChatCommentBatch.svelte";
  import { TranscriptController } from "./comments.svelte.js";
  import type { TranscriptBlock, TranscriptProps } from "./model.js";
  const block: TranscriptBlock = {
    id: "note/body",
    revision: "1",
    kind: "markdown",
    label: "Original note",
    text: "A **captured** quote.",
  };
  const props: TranscriptProps = {
    items: [],
    externalBlocks: [block],
    author: { id: "you", name: "You" },
  };
  const state = new TranscriptController(() => props);
  function populate() {
    state.open(block, { from: 0, to: block.text.length }, "Keep this draft");
  }
  populate();
</script>

<Button onclick={() => (state.threads = [])}>Switch conversation</Button>
<Button onclick={populate}>Restore draft</Button>
<ChatCommentBatch {state} />
