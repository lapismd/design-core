export const Basic = `<script lang="ts">
  import { LayoutScrollButton } from "@lapismd/design-core/ai/chat";
  let displaced = $state(true);
  let running = $state(true);
  function latest() { /* Ask the owning viewport or virtualizer to jump to its end. */ }
</script>
<div style="position:relative;height:12rem">
  <LayoutScrollButton isVisible={displaced} isRunning={running} onClick={latest} />
</div>`;
