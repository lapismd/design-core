<script lang="ts">
  import { Accordion as AccordionPrimitive } from "bits-ui";
  import { type WithoutChild } from "../../../lib/utils.js";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

  let {
    ref = $bindable(null),
    class: className,
    level = 3,
    children,
    ...restProps
  }: WithoutChild<AccordionPrimitive.TriggerProps> & {
    level?: AccordionPrimitive.HeaderProps["level"];
  } = $props();
</script>

<AccordionPrimitive.Header {level} class="flex">
  <AccordionPrimitive.Trigger
    data-ui-component="accordion"
  data-ui-part="accordion-trigger"
  data-slot="accordion-trigger"
    bind:ref
    class={className}
    {...restProps}
  >
    <ChevronRightIcon
      data-ui-component="accordion"
  data-ui-part="accordion-trigger"
  data-slot="accordion-trigger-icon"
      class="cn-accordion-trigger-icon text-muted-foreground pointer-events-none absolute top-1/2 -left-5 size-4 -translate-y-1/2 group-aria-expanded/accordion-trigger:hidden"
    />
    <ChevronDownIcon
      data-ui-component="accordion"
  data-ui-part="accordion-trigger"
  data-slot="accordion-trigger-icon"
      class="cn-accordion-trigger-icon text-muted-foreground pointer-events-none absolute top-1/2 -left-5 hidden size-4 -translate-y-1/2 group-aria-expanded/accordion-trigger:inline"
    />
    <span class="min-w-0 flex-1 truncate">{@render children?.()}</span>
  </AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
