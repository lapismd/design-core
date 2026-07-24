<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLTdAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLTdAttributes> = $props();
</script>

<td
  bind:this={ref}
  {...restProps}
  data-ui-component="table"
  data-ui-part="table-cell"
  data-slot="table-cell"
  class={className}
>
  {@render children?.()}
</td>
