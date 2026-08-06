<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
  import CheckIcon from "@lucide/svelte/icons/check";
  import { type WithoutChild } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    inset,
    children: childrenProp,
    ...restProps
  }: WithoutChild<ContextMenuPrimitive.RadioItemProps> & {
    inset?: boolean;
  } = $props();
</script>

<ContextMenuPrimitive.RadioItem
  bind:ref
  data-ui-component="context-menu"
  data-ui-part="context-menu-radio-item"
  data-slot="context-menu-radio-item"
  data-inset={inset}
  class={className}
  {...restProps}
>
  {#snippet children({ checked })}
    <span
      data-ui-component="context-menu"
      data-ui-part="context-menu-radio-item-anon-0"
      data-slot="context-menu-radio-item-anon-0"
    >
      {#if checked}
        <CheckIcon />
      {/if}
    </span>
    {@render childrenProp?.({ checked })}
  {/snippet}
</ContextMenuPrimitive.RadioItem>
