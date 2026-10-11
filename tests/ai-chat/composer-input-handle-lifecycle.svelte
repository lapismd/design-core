<script lang="ts">
  import {
    ComposerInput,
    type ComposerInputHandle,
  } from "@lapismd/design-core/ai/chat";

  let mounted = $state(true);
  let handle = $state<ComposerInputHandle | null>(null);
  const replacement: ComposerInputHandle = {
    focus() {},
    getValue: () => "replacement",
    insertText() {},
    insertToken: () => "replacement",
    expandToken: () => false,
  };
  const ownership = $derived(
    handle === null
      ? "released"
      : handle.getValue() === "replacement"
        ? "replacement"
        : "owned",
  );
</script>

<div>
  {#if mounted}
    <ComposerInput bind:handle value="owned" />
  {/if}
  <button type="button" onclick={() => (mounted = !mounted)}>
    {mounted ? "Unmount input" : "Mount input"}
  </button>
  <button type="button" onclick={() => (handle = replacement)}>
    Replace handle
  </button>
  <output data-testid="handle-ownership">{ownership}</output>
</div>
