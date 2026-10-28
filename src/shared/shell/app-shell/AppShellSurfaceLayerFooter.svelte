<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<footer
  bind:this={ref}
  {...restProps}
  data-ui-component="app-shell"
  data-ui-part="surface-layer-footer"
>
  {@render children?.()}
</footer>
