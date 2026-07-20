<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";
  import { omitDataUiIdentity } from "../../../lib/data-ui-host.js";

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
    {...omitDataUiIdentity(restProps)}
    data-ui-component="sidebar"
    data-ui-part="sidebar-root"
    data-slot="sidebar"
    class={className}
  >
    {@render children?.()}
  </aside>
{/if}
