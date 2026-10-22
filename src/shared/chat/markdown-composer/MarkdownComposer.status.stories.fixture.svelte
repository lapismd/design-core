<script lang="ts">
  import { untrack } from "svelte";
  import MarkdownComposer from "./MarkdownComposer.svelte";
  import { Avatar } from "../../shadcn/avatar/index.js";
  import { Button } from "../../shadcn/button/index.js";
  import type { ComposerStatus } from "../../ai/types.js";
  let {
    kind = "warning",
    position = "bottom",
  }: { kind?: "warning" | "error"; position?: "top" | "bottom" } = $props();
  let value = $state("Retain this exact draft.");
  let presentation = $state<"document" | "framed">("document");
  let status = $state<ComposerStatus | undefined>(
    untrack(() => ({
      type: kind,
      message:
        kind === "warning"
          ? "Context window is 90% full."
          : "Delivery failed. Your draft is retained.",
    })),
  );
</script>

<div style="max-width:48rem;padding:1.5rem">
  <MarkdownComposer
    bind:value
    {presentation}
    {status}
    statusPosition={position}
    dockActions
    showSendButton={false}
    showHint={false}
    onSubmit={() => {}}
  >
    {#snippet avatar()}<Avatar
        name="You"
        initials="YO"
        size="sm"
        decorative
      />{/snippet}
  </MarkdownComposer>
  <Button
    variant="outline"
    onclick={() =>
      (presentation = presentation === "document" ? "framed" : "document")}
    >Switch presentation</Button
  >
  <Button variant="outline" onclick={() => (status = undefined)}
    >Clear status</Button
  >
</div>
