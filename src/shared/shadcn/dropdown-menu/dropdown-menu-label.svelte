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
  data-ui-component="dropdown-menu"
  data-ui-part="dropdown-menu-label"
    data-slot="dropdown-menu-label"
  data-inset={inset}
  class={className}
  {...restProps}
>
  {@render children?.()}
</div>
