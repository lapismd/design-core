<script lang="ts">
  import { flushSync } from "svelte";
  import * as SwipeItem from "./index.js";
  import type { SwipeItemOpen, SwipeItemFullSwipeEvent } from "./types.js";

  let {
    behavior,
    onEvent,
    removeOwner,
  }: {
    behavior: string;
    onEvent: (event: string) => void;
    removeOwner: () => void;
  } = $props();
  let actionVisible = $state(true);
  let open = $state<SwipeItemOpen>("end");
  let row = $state({ disabled: false });
  const showRowSwipe = $derived(!row.disabled && behavior !== "disabled");
  const swipeEnabled = $derived(showRowSwipe && !row.disabled);
  const policies = {
    close: { closeOnSelect: true },
    keep: { closeOnSelect: false },
  };

  function select(event: MouseEvent) {
    const mode = behavior;
    onEvent("action");
    if (mode === "prevent") event.preventDefault();
    if (mode === "remove-root") removeOwner();
    if (mode === "remove-action")
      flushSync(() => {
        actionVisible = false;
      });
  }

  function changed(next: SwipeItemOpen) {
    if (next !== null) return;
    onEvent("closed");
    if (behavior === "close-removes-root") removeOwner();
  }

  function commit(event: SwipeItemFullSwipeEvent) {
    onEvent(`full:${event.pointerType}`);
    removeOwner();
  }
</script>

{#if row}
  <SwipeItem.Root
    bind:open
    disabled={!swipeEnabled}
    onOpenChange={changed}
    data-testid="lifetime-item"
  >
    <SwipeItem.Actions side="end" aria-label="Row actions" onFullSwipe={commit}>
      {#if actionVisible}
        {@const policy =
          behavior === "keep-open" ? policies.keep : policies.close}
        <SwipeItem.Action
          closeOnSelect={policy.closeOnSelect}
          onclick={select}
          aria-label="Select row action">Select</SwipeItem.Action
        >
      {/if}
    </SwipeItem.Actions>
    <SwipeItem.Content data-testid="lifetime-content"
      ><div class="row">Disposable row</div></SwipeItem.Content
    >
  </SwipeItem.Root>
{/if}

<style>
  .row {
    min-block-size: 4rem;
    padding: 1rem;
  }
</style>
