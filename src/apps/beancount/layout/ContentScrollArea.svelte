<script lang="ts">
  import type { Snippet } from "svelte";
  import * as ScrollArea from "@stevejuma/ui/shadcn/scroll-area";
  import { cn } from "../../../lib/utils.js";

  /** Additional classes for the scrolling viewport. */
  let {
    class: className = "",
    contentClass = "",
    children,
  }: {
    class?: string;
    contentClass?: string;
    children?: Snippet;
  } = $props();
</script>

<ScrollArea.Root
  data-content-scroll-area
  class={cn("bc-content-scroll-area", className)}
>
  <div class={cn("bc-content-scroll-area__content", contentClass)}>
    {@render children?.()}
  </div>
</ScrollArea.Root>

<style>
  :global(.bc-content-scroll-area) {
    min-width: 0;
    min-height: 0;
    height: 100%;
  }

  .bc-content-scroll-area__content {
    min-width: 0;
  }
</style>
