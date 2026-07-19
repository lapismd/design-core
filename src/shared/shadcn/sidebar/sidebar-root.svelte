<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    open = $bindable(true),
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>> & {
    open?: boolean;
  } = $props();
</script>

{#if open}
  <aside
    bind:this={ref}
    data-ui-component="sidebar"
    data-ui-part="sidebar-root"
        data-slot="sidebar"
    class={className}
    {...restProps}
  >
    {@render children?.()}
  </aside>
{/if}
