export const Layout = String.raw`<script lang="ts">
  import { ToolCalls } from "@lapismd/design-core/ai/chat";
  const longName = "Read " + "a-long-directory-name/".repeat(32) + "source.ts";
</script>

{#snippet detail()}<p>Captured contents</p>{/snippet}
<section style="width: 50rem; max-width: 100%;">
  <ToolCalls
    style="--ui-ai-chat-tool-width: 100%; --ui-ai-chat-tool-trigger-padding-inline: 0.5rem;"
    calls={[
      { id: "read", name: longName, status: "complete", detail },
      { id: "edit", name: longName + " edit", status: "complete", detail },
    ]}
  />
</section>`;
