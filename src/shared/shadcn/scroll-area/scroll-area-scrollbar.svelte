<script lang="ts">
  import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";
  import { type WithoutChild } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    orientation = "vertical",
    children,
    ...restProps
  }: WithoutChild<ScrollAreaPrimitive.ScrollbarProps> = $props();
</script>

<ScrollAreaPrimitive.Scrollbar
  bind:ref
  data-ui-component="scroll-area"
  data-ui-part="scroll-area-scrollbar"
    data-slot="scroll-area-scrollbar"
  data-orientation={orientation}
  {orientation}
  class={className}
  {...restProps}
>
  {@render children?.()}
  <ScrollAreaPrimitive.Thumb
    data-ui-component="scroll-area"
    data-ui-part="scroll-area-scrollbar"
        data-slot="scroll-area-thumb"
    class="bg-border relative flex-1 rounded-full"
  />
</ScrollAreaPrimitive.Scrollbar>
