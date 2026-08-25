<script lang="ts">
  import * as ScrollArea from "./index.js";

  let { items }: { items: string[] } = $props();
  let viewportRef = $state<HTMLElement | null>(null);

  $effect(() => {
    const element = viewportRef;
    if (!element) return;
    element.dataset.scrollAreaBoundViewport = "true";
    return () => {
      delete element.dataset.scrollAreaBoundViewport;
    };
  });
</script>

<ScrollArea.Root
  bind:viewportRef
  class="scroll-area-story__root"
  aria-label="Catalog items"
>
  <ul class="scroll-area-story__list">
    {#each items as item (item)}
      <li>
        <a href={`#${item}`}>{item}</a>
      </li>
    {/each}
  </ul>
</ScrollArea.Root>

<style>
  :global(.scroll-area-story__root) {
    width: 14rem;
    height: 10rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
  }

  .scroll-area-story__list {
    display: flex;
    margin: 0;
    padding: 0.75rem;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    list-style: none;
  }
</style>
