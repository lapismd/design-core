<script lang="ts">
  import { Accordion as AccordionPrimitive } from "bits-ui";
  import { type WithoutChild } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithoutChild<AccordionPrimitive.ContentProps> = $props();
</script>

<AccordionPrimitive.Content
  bind:ref
  data-ui-component="accordion"
  data-ui-part="accordion-content"
  data-slot="accordion-content"
  class="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden text-sm"
  {...restProps}
>
  <div
    class={className}
  >
    {@render children?.()}
  </div>
</AccordionPrimitive.Content>
