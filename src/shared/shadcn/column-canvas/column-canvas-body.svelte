<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../../lib/utils.js";
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

  function handleScroll(
    event: Event & { currentTarget: HTMLDivElement },
  ): void {
    if (!onScrollNearEnd) return;
    const element = event.currentTarget;
    if (
      element.scrollHeight - element.scrollTop - element.clientHeight <=
      180
    ) {
      onScrollNearEnd();
    }
  }
</script>

<div
  bind:this={ref}
  {...restProps}
  class={className}
  data-ui-component="column-canvas"
  data-ui-part="column-body"
  onscroll={handleScroll}
>
  {@render children?.()}
</div>
