<script lang="ts">
  import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
  import CircleIcon from "@lucide/svelte/icons/circle";
  import { type WithoutChildrenOrChild } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: WithoutChildrenOrChild<RadioGroupPrimitive.ItemProps> = $props();
</script>

<RadioGroupPrimitive.Item
  bind:ref
  data-ui-component="radio-group"
  data-ui-part="radio-group-item"
  data-slot="radio-group-item"
  class={className}
  {...restProps}
>
  {#snippet children({ checked })}
    <div
      data-ui-component="radio-group"
      data-ui-part="radio-group-indicator"
      data-slot="radio-group-indicator"
    >
      {#if checked}
        <CircleIcon
          data-ui-component="radio-group"
          data-ui-part="radio-group-circle-icon"
          data-slot="radio-group-circle-icon"
        />
      {/if}
    </div>
  {/snippet}
</RadioGroupPrimitive.Item>
