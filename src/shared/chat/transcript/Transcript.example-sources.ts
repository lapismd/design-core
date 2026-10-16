export const Basic = `<script lang="ts">
  import { Transcript, TranscriptController, MarkdownComposer, type TranscriptItem } from "@lapismd/design-core/chat";
  let items = $state<TranscriptItem[]>([{ id: "reply", kind: "message", role: "assistant", label: "Reply", author: { id: "agent", name: "Assistant" }, blocks: [{ id: "reply/body", revision: "1", kind: "markdown", label: "Reply", text: "A continuous **conversation**." }] }]);
  const controller = new TranscriptController(() => ({ items, canComment: true,
    onSend: async (snapshot) => { /* The host delivers snapshot and returns an explicit outcome. */ return { publication: "queued", batchId: snapshot.id }; }
  }));
</script>
<div style="height: 36rem">
  <Transcript {items} commentState={controller}>
    {#snippet composer()}<MarkdownComposer bind:value={controller.message} presentation="document" onSubmit={() => { void controller.send(); }} />{/snippet}
  </Transcript>
</div>`;

export const Inspector = `<script lang="ts">
  import { Transcript, TranscriptContent, TranscriptController, type TranscriptItem } from "@lapismd/design-core/chat";
  const blocks = [{id: "capture", revision: "1", kind: "custom" as const, label: "Capture", text: "Exact captured content."}];
  const items: TranscriptItem[] = [{id: "message", kind: "message", label: "Capture", blocks}];
  const controller = new TranscriptController(() => ({items}));
  let inspecting = $state(false);
</script>
<button onclick={() => inspecting = !inspecting}>Toggle inspector</button>
<div style="height: 24rem"><Transcript {items} commentState={controller} /></div>
{#if inspecting}<aside aria-label="Source inspector"><TranscriptContent {blocks} state={controller} /></aside>{/if}`;
