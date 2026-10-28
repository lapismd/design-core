<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../../lib/utils.js";
  import "./AppShellTopbar.css";

  let {
    ref = $bindable(null),
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="app-shell"
  data-ui-part="topbar-target"
>
  {@render children?.()}
</div>
