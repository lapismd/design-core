<script lang="ts">
  import type { Snippet } from "svelte";
  import * as ScrollArea from "@stevejuma/ui/shadcn/scroll-area";
  import { cn } from "../../../lib/utils.js";

  /** Additional classes for the scrolling viewport. */
  let {
    class: className = "",
    contentClass = "",
    ariaLabel = "Scrollable page content",
    children,
  }: {
    class?: string;
    contentClass?: string;
    /** Accessible name for the keyboard-focusable page viewport. */
    ariaLabel?: string;
    children?: Snippet;
  } = $props();

  let viewport = $state<HTMLElement | null>(null);

  $effect(() => {
    if (!viewport) return;
    viewport.tabIndex = 0;
    viewport.setAttribute("role", "region");
    viewport.setAttribute("aria-label", ariaLabel);
  });
</script>

<ScrollArea.Root
  data-content-scroll-area
  class={cn("bc-content-scroll-area", className)}
  bind:viewportRef={viewport}
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
