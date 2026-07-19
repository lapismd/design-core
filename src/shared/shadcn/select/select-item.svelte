<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui";
  import { type WithoutChild } from "../../../lib/utils.js";
  import CheckIcon from "@lucide/svelte/icons/check";

  let {
    ref = $bindable(null),
    class: className,
    value,
    label,
    children: childrenProp,
    ...restProps
  }: WithoutChild<SelectPrimitive.ItemProps> = $props();
</script>

<SelectPrimitive.Item
  bind:ref
  {value}
  data-ui-component="select"
  data-ui-part="select-item"
    data-slot="select-item"
  class={className}
  {...restProps}
>
  {#snippet children({ selected, highlighted })}
    <span class="absolute end-2 flex size-3.5 items-center justify-center">
      {#if selected}
        <CheckIcon class="cn-select-item-indicator-icon" />
      {/if}
    </span>
    <span class="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
      {#if childrenProp}
        {@render childrenProp({ selected, highlighted })}
      {:else}
        {label || value}
      {/if}
    </span>
  {/snippet}
</SelectPrimitive.Item>
