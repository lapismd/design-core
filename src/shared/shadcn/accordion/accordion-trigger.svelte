<script lang="ts">
  import { Accordion as AccordionPrimitive } from "bits-ui";
  import { cn, type WithoutChild } from "../../../lib/utils.js";
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
    data-slot="accordion-trigger"
    bind:ref
    class={cn(
      "focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:after:border-ring group/accordion-trigger relative ml-5 flex flex-1 items-start rounded-md border border-transparent py-3 text-left text-sm font-medium transition-all outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...restProps}
  >
    <ChevronRightIcon
      data-slot="accordion-trigger-icon"
      class="cn-accordion-trigger-icon text-muted-foreground pointer-events-none absolute top-1/2 -left-5 size-4 -translate-y-1/2 group-aria-expanded/accordion-trigger:hidden"
    />
    <ChevronDownIcon
      data-slot="accordion-trigger-icon"
      class="cn-accordion-trigger-icon text-muted-foreground pointer-events-none absolute top-1/2 -left-5 hidden size-4 -translate-y-1/2 group-aria-expanded/accordion-trigger:inline"
    />
    <span class="min-w-0 flex-1 truncate">{@render children?.()}</span>
  </AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
