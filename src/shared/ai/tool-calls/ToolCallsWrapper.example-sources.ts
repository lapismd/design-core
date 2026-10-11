export const PerCallActions = `<script lang="ts">
  import { ToolCalls, type ToolCallItem } from "@lapismd/design-core/ai/chat";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import type { Snippet } from "svelte";
  let selected = $state("");
</script>

{#snippet callWrapper(call: ToolCallItem, children: Snippet)}
  <div>
    {@render children()}
    <Button onclick={() => selected = call.id ?? call.name}>
      Reply to {call.name}
    </Button>
  </div>
{/snippet}

<ToolCalls calls={[
  { id: "read", name: "Read file", status: "complete" },
  { id: "edit", name: "Edit file", status: "pending" },
]} {callWrapper} />
<output>Replying to {selected}</output>`;
