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
  data-ui-component="empty"
  data-ui-part="empty-title"
  data-slot="empty-title"
  class={className}
  {...restProps}
>
  {@render children?.()}
</div>
