<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import { type WithoutChild } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    inset,
    children,
    ...restProps
  }: WithoutChild<ContextMenuPrimitive.SubTriggerProps> & {
    inset?: boolean;
  } = $props();
</script>

<ContextMenuPrimitive.SubTrigger
  bind:ref
  data-ui-component="context-menu"
  data-ui-part="context-menu-sub-trigger"
  data-slot="context-menu-sub-trigger"
  data-inset={inset}
  class={className}
  {...restProps}
>
  {@render children?.()}
  <ChevronRightIcon data-ui-part="context-menu-sub-trigger-icon" />
</ContextMenuPrimitive.SubTrigger>

<style>
  :global {
    [data-ui-component="context-menu"][data-ui-part="context-menu-sub-trigger-icon"] {
      margin-inline-start: auto;
    }
  }
</style>
