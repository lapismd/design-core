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
  data-ui-component="card"
  data-ui-part="card-action"
  data-slot="card-action"
  class={className}
  {...restProps}
>
  {@render children?.()}
</div>
