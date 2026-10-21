export const Basic = `<script lang="ts">
 import { MarkdownComposer, type MarkdownComposerTrigger } from "@lapismd/design-core/chat";
 let value=$state("");
 const triggers:MarkdownComposerTrigger[]=[{character:"@",searchSource:async(query,signal)=>[{id:"alex",label:"Alex Morgan"}].filter(item=>item.label.toLowerCase().includes(query.toLowerCase())),onSelect:item=>\`@\${item.label} \`}];
</script>
<MarkdownComposer bind:value {triggers} onSubmit={text=>console.log(text)} />`;
