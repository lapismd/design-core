<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    inset,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    inset?: boolean;
  } = $props();
</script>

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="context-menu"
  data-ui-part="context-menu-label"
  data-slot="context-menu-label"
  data-inset={inset}
  class={className}
>
  {@render children?.()}
</div>
