<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  data-ui-component="sidebar"
  data-ui-part="sidebar-header"
    data-slot="sidebar-header"
  class={className}
  {...restProps}
>
  {@render children?.()}
</div>
