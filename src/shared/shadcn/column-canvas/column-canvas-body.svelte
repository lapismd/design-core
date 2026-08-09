<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../../lib/utils.js";
  import { ScrollArea } from "../scroll-area/index.js";
  import { useColumnCanvasColumn } from "./column-canvas-column-context.svelte.js";

  let {
    ref = $bindable(null),
    class: className,
    onScrollNearEnd,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    /** Fired when the body scrolls within 180px of the bottom. */
    onScrollNearEnd?: () => void;
    children?: Snippet;
  } = $props();

  useColumnCanvasColumn();

  let viewportRef = $state<HTMLElement | null>(null);

  $effect(() => {
    const element = viewportRef;
    const nearEnd = onScrollNearEnd;
    if (!element || !nearEnd) return;

    function handleScroll(): void {
      if (
        element!.scrollHeight - element!.scrollTop - element!.clientHeight <=
        180
      ) {
        nearEnd!();
      }
    }

    element.addEventListener("scroll", handleScroll);
    return () => element.removeEventListener("scroll", handleScroll);
  });
</script>

<div
  bind:this={ref}
  {...restProps}
  class={className}
  data-ui-component="column-canvas"
  data-ui-part="column-body"
>
  <ScrollArea type="auto" orientation="vertical" bind:viewportRef>
    {@render children?.()}
  </ScrollArea>
</div>
