<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLLiAttributes } from "svelte/elements";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLLiAttributes> = $props();
</script>

<li
  bind:this={ref}
  {...restProps}
  data-ui-component="breadcrumb"
  data-ui-part="breadcrumb-separator"
  data-slot="breadcrumb-separator"
  role="presentation"
  aria-hidden="true"
  class={className}
>
  {#if children}
    {@render children?.()}
  {:else}
    <ChevronRightIcon />
  {/if}
</li>
