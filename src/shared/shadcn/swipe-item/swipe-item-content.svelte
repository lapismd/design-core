<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { useSwipeItemState } from "./swipe-item-context.svelte.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLDivElement | null;
  } = $props();

  const state = useSwipeItemState();
  $effect(() => state.bindContent(ref));
</script>

<div
  bind:this={ref}
  {...restProps}
  class={className}
  data-ui-component="swipe-item"
  data-ui-part="content"
  onpointerdown={state.handlePointerDown}
  onpointermove={state.handlePointerMove}
  onpointerup={state.handlePointerEnd}
  onpointercancel={state.handlePointerCancel}
  onlostpointercapture={state.handleLostPointerCapture}
  onclickcapture={state.handleContentClickCapture}
>
  {@render children?.()}
</div>
