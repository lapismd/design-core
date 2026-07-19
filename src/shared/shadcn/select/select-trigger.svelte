<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui";
  import { type WithoutChild } from "../../../lib/utils.js";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";

  let {
    ref = $bindable(null),
    class: className,
    children,
    size = "default",
    ...restProps
  }: WithoutChild<SelectPrimitive.TriggerProps> & {
    size?: "sm" | "default";
  } = $props();
</script>

<SelectPrimitive.Trigger
  bind:ref
  data-ui-component="select"
  data-ui-part="select-trigger"
    data-slot="select-trigger"
  data-size={size}
  class={className}
  {...restProps}
>
  {@render children?.()}
  <ChevronDownIcon class="text-muted-foreground pointer-events-none size-4" />
</SelectPrimitive.Trigger>
