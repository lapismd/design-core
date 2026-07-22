<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui";
  import { type WithoutChildrenOrChild } from "../../../lib/utils.js";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: WithoutChildrenOrChild<SelectPrimitive.ScrollDownButtonProps> = $props();
</script>

<SelectPrimitive.ScrollDownButton
  bind:ref
  data-ui-component="select"
  data-ui-part="select-scroll-down-button"
  data-slot="select-scroll-down-button"
  class={className}
  {...restProps}
>
  <ChevronDownIcon />
</SelectPrimitive.ScrollDownButton>
