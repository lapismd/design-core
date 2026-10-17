export const Basic = `<script lang="ts">
  import { Transcript, TranscriptFooter, TranscriptController, MarkdownComposer, type TranscriptItem } from "@lapismd/design-core/chat";
  let items = $state<TranscriptItem[]>([{ id: "reply", kind: "message", role: "assistant", label: "Reply", author: { id: "agent", name: "Assistant" }, blocks: [{ id: "reply/body", revision: "1", kind: "markdown", label: "Reply", text: "A continuous **conversation**." }] }]);
  const controller = new TranscriptController(() => ({ items, canComment: true,
    onSend: async (snapshot) => { /* The host delivers snapshot and returns an explicit outcome. */ return { publication: "queued", batchId: snapshot.id }; }
  }));
</script>
<div style="height: 36rem">
  <Transcript {items} commentState={controller}>
    {#snippet composer()}<MarkdownComposer bind:value={controller.message} presentation="document" showSendButton={false} onSubmit={() => { void controller.send(); }} />{/snippet}
    {#snippet footer()}<TranscriptFooter state={controller} />{/snippet}
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

export const QueuedMessages = `<script lang="ts">
  import { Transcript, TranscriptFooter, MessageQueue, MarkdownComposer, TranscriptController, type TranscriptItem, type TranscriptQueuedMessage } from "@lapismd/design-core/chat";
  const items: TranscriptItem[] = [{id:"response",kind:"message",label:"Response",role:"assistant",author:{id:"agent",name:"Assistant"},blocks:[{id:"response/body",revision:"1",kind:"markdown",label:"Response",text:"I’m reviewing the captured context."}]}];
  let busy = $state(true);
  let queued = $state<TranscriptQueuedMessage[]>([{id:"waiting",submission:{id:"waiting",text:"Review the documentation afterwards.",comments:[]},recipients:[{id:"agent",label:"Assistant",state:"queued"}]}]);
  const controller = new TranscriptController(() => ({items, canComment:true, onSend:(snapshot) => {
    // This callback is the host adapter. A real host must acknowledge its queue.
    queued = [...queued,{id:snapshot.id,submission:snapshot,recipients:[{id:"agent",label:"Assistant",state:"queued"}]}];
    return {publication:"queued",batchId:snapshot.id};
  }}));
</script>
<div style="height:36rem"><Transcript {items} commentState={controller}>
  {#snippet queuedMessages()}<MessageQueue entries={queued} onCancel={(entry, recipient) => { /* Request host cancellation; retain the entry until acknowledged. */ }} />{/snippet}
  {#snippet composer()}<MarkdownComposer bind:value={controller.message} presentation="document" showSendButton={false} onSubmit={() => {void controller.send();}} />{/snippet}
  {#snippet footer()}<TranscriptFooter state={controller} {busy} onStop={() => { /* Request the host to stop. */ }} />{/snippet}
</Transcript></div>`;

export const ReactionsAndProfiles = `<script lang="ts">
  import { Transcript, type TranscriptItem, type Reaction } from "@lapismd/design-core/chat";
  const author = {id:"person",name:"Alex Morgan",initials:"AM"};
  const items: TranscriptItem[] = [{id:"message",kind:"message",role:"user",label:"Request",author,blocks:[{id:"message/body",revision:"1",kind:"markdown",label:"Request",text:"Please review this change."}]}];
  let reactions = $state<Record<string, Reaction[]>>({});
</script>
<div style="height:24rem"><Transcript {items} {reactions} onReact={(id, emoji, custom) => {reactions = {...reactions,[id]:[{emoji,...(custom ? {custom} : {}),count:1,selected:true}]};}} authorPopover={{description: () => "Project maintainer",actions: (person) => [{id:"profile",label:"View profile",onSelect: () => { /* Open the host profile route for person.id. */ }}]}} /></div>`;

export const RecordedConversation = `<script lang="ts">
  import { Transcript, TranscriptFooter, TranscriptController, MarkdownComposer, promptElementsExtension, type TranscriptItem, type TranscriptCommentThread } from "@lapismd/design-core/chat";
  import { SegmentedControl } from "@lapismd/design-core/forms";
  let view = $state<"document" | "classic">("document");
  // Supply normalized captured items and exact anchors from a host-owned recording.
  let { items, threads }: {items: readonly TranscriptItem[]; threads: TranscriptCommentThread[]} = $props();
  const controller = new TranscriptController(() => ({items,canComment:true,onSend:() => ({publication:"unknown",error:"Connect a host delivery adapter to send."})}));
  controller.threads = threads;
</script>
<SegmentedControl value={view} options={["document", "classic"]} labels={{document:"Document",classic:"Classic"}} ariaLabel="Conversation view" onChange={(next) => { if (next === "document" || next === "classic") view = next; }} />
<div style="height:40rem"><Transcript {view} {items} commentState={controller} markdown={{extensions:[promptElementsExtension]}}>
  {#snippet composer(currentView)}<MarkdownComposer bind:value={controller.message} presentation={currentView === "document" ? "document" : "framed"} showSendButton={false} onSubmit={() => {void controller.send();}} />{/snippet}
  {#snippet footer()}<TranscriptFooter state={controller} />{/snippet}
</Transcript></div>`;
