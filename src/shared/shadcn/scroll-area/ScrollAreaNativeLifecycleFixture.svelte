<script lang="ts">
  import { onDestroy } from "svelte";
  import { ScrollArea } from "./index.js";
  const root = document.documentElement;
  const previous = root.getAttribute("data-ui-scroll-strategy");
  root.dataset.uiScrollStrategy = "native";
  onDestroy(() => {
    if (previous === null) root.removeAttribute("data-ui-scroll-strategy");
    else root.setAttribute("data-ui-scroll-strategy", previous);
  });
  let mounted = $state(true);
</script>

<button onclick={() => (mounted = !mounted)}>Toggle native viewport</button>
{#if mounted}<ScrollArea
    aria-label="Native lifecycle"
    type="auto"
    class="lifecycle-area"
  >
    {#each Array.from({ length: 60 }) as _, i}<p>Entry {i}</p>{/each}
  </ScrollArea>{/if}

<style>
  :global(.lifecycle-area) {
    height: 10rem;
    width: 16rem;
  }
</style>
