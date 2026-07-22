<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();
</script>

<span
  bind:this={ref}
  data-ui-component="input-group"
  data-ui-part="input-group-text"
  data-slot="input-group-text"
  class={className}
  {...restProps}
>
  {@render children?.()}
</span>
