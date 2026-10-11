<script lang="ts">
  import { Button } from "../button/index.js";
  import { ScrollArea } from "./index.js";

  let { type = "always" }: { type?: "always" | "auto" } = $props();
  let mounted = $state(false);
  let clicks = $state(0);
</script>

<Button onclick={() => (mounted = !mounted)}>Toggle styled viewport</Button>
<Button onclick={() => clicks++}>Remaining control</Button>
<p role="status">Remaining clicks: {clicks}</p>
{#if mounted}
  <ScrollArea
    aria-label="Styled lifecycle"
    {type}
    orientation="both"
    scrollStrategy="styled"
    class="styled-lifecycle-area"
  >
    <div class="styled-lifecycle-content">
      {#each Array.from({ length: 40 }) as _, index}
        <p>Entry {index + 1}</p>
      {/each}
    </div>
  </ScrollArea>
{/if}

<style>
  :global(.styled-lifecycle-area) {
    height: 10rem;
    width: 16rem;
  }

  .styled-lifecycle-content {
    width: 30rem;
  }
</style>
