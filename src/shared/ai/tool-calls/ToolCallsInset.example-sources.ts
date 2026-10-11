export const Inset = `<script lang="ts">
  import { ToolCalls } from '@lapismd/design-core/ai/chat';
</script>

{#snippet detail()}<p>Captured file contents</p>{/snippet}
<ToolCalls
  style="--ui-ai-chat-tool-trigger-padding-inline: 0.5rem;"
  calls={[{ name: 'Read file', status: 'complete', detail }]}
/>`;
