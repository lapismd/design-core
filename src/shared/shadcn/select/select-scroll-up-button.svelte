<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui";
  import { type WithoutChildrenOrChild } from "../../../lib/utils.js";
  import ChevronUpIcon from "@lucide/svelte/icons/chevron-up";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: WithoutChildrenOrChild<SelectPrimitive.ScrollUpButtonProps> = $props();
</script>

<SelectPrimitive.ScrollUpButton
  bind:ref
  data-ui-component="select"
  data-ui-part="select-scroll-up-button"
  data-slot="select-scroll-up-button"
  class={className}
  {...restProps}
>
  <ChevronUpIcon />
</SelectPrimitive.ScrollUpButton>
