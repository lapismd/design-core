export const Basic = `<script lang="ts">
 import { ThreadPanel, type ThreadMessage } from "@lapismd/design-core/chat";
 let value=$state("");
 let messages=$state<ThreadMessage[]>([{id:"root",author:{id:"alex",name:"Alex Morgan"},content:"Review the release."},{id:"reply",parentId:"root",author:{id:"lee",name:"Lee Taylor"},content:"Ready for review."}]);
</script>
<div style="height:36rem"><ThreadPanel rootId="root" {messages} bind:value onSubmit={snapshot=>console.log(snapshot)} /></div>`;
