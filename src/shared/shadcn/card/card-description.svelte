<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { type WithElementRef } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLParagraphElement>> = $props();
</script>

<p
  bind:this={ref}
  data-ui-component="card"
  data-ui-part="card-description"
  data-slot="card-description"
  class={className}
  {...restProps}
>
  {@render children?.()}
</p>
