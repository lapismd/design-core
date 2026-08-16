<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();
</script>

<span
  bind:this={ref}
  data-ui-component="command-view"
  data-ui-part="item-icon"
  data-slot="command-view-item-icon"
  class={className}
  {...restProps}
>
  {@render children?.()}
</span>
