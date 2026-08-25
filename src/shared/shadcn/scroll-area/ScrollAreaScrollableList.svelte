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
  class="h-40 w-56 rounded-md border"
  aria-label="Catalog items"
>
  <ul class="flex flex-col gap-2 p-3 text-sm">
    {#each items as item (item)}
      <li>
        <a href={`#${item}`}>{item}</a>
      </li>
    {/each}
  </ul>
</ScrollArea.Root>
