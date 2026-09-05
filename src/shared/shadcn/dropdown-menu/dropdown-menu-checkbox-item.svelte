<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
  import MinusIcon from "@lucide/svelte/icons/minus";
  import CheckIcon from "@lucide/svelte/icons/check";
  import { type WithoutChildrenOrChild } from "../../../lib/utils.js";
  import type { Snippet } from "svelte";

  let {
    ref = $bindable(null),
    checked = $bindable(false),
    indeterminate = $bindable(false),
    class: className,
    children: childrenProp,
    ...restProps
  }: WithoutChildrenOrChild<DropdownMenuPrimitive.CheckboxItemProps> & {
    children?: Snippet;
  } = $props();
</script>

<DropdownMenuPrimitive.CheckboxItem
  bind:ref
  bind:checked
  bind:indeterminate
  data-ui-component="dropdown-menu"
  data-ui-part="dropdown-menu-checkbox-item"
  data-slot="dropdown-menu-checkbox-item"
  class={className}
  {...restProps}
>
  {#snippet children({ checked, indeterminate })}
    <span
      data-ui-component="dropdown-menu"
      data-ui-part="dropdown-menu-checkbox-item-indicator"
      data-slot="dropdown-menu-checkbox-item-indicator"
    >
      {#if indeterminate}
        <MinusIcon />
      {:else if checked}
        <CheckIcon />
      {/if}
    </span>
    {@render childrenProp?.()}
  {/snippet}
</DropdownMenuPrimitive.CheckboxItem>
