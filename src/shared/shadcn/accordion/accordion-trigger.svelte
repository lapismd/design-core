<script lang="ts">
  import { Accordion as AccordionPrimitive } from "bits-ui";
  import { type WithoutChild } from "../../../lib/utils.js";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import ChevronUpIcon from "@lucide/svelte/icons/chevron-up";

  let {
    ref = $bindable(null),
    class: className,
    level = 3,
    indicatorPosition = "end",
    indicatorVariant = "vertical",
    children,
    ...restProps
  }: WithoutChild<AccordionPrimitive.TriggerProps> & {
    level?: AccordionPrimitive.HeaderProps["level"];
    /** Places the built-in disclosure indicator before or after the label. */
    indicatorPosition?: "start" | "end";
    /** Chooses vertical expand/collapse arrows or right/down disclosure arrows. */
    indicatorVariant?: "vertical" | "disclosure";
  } = $props();
</script>

<AccordionPrimitive.Header
  {level}
  data-ui-component="accordion"
  data-ui-part="accordion-header"
  data-slot="accordion-header"
>
  <AccordionPrimitive.Trigger
    data-ui-component="accordion"
    data-ui-part="accordion-trigger"
    data-slot="accordion-trigger"
    data-indicator-position={indicatorPosition}
    data-indicator-variant={indicatorVariant}
    bind:ref
    class={className}
    {...restProps}
  >
    {@render children?.()}
    {#if indicatorVariant === "disclosure"}
      <ChevronRightIcon
        data-ui-component="accordion"
        data-ui-part="accordion-collapsed-icon"
        data-slot="accordion-trigger-icon"
        data-indicator-glyph="chevron-right"
      />
      <ChevronDownIcon
        data-ui-component="accordion"
        data-ui-part="accordion-expanded-icon"
        data-slot="accordion-trigger-icon"
        data-indicator-glyph="chevron-down"
      />
    {:else}
      <ChevronDownIcon
        data-ui-component="accordion"
        data-ui-part="accordion-collapsed-icon"
        data-slot="accordion-trigger-icon"
        data-indicator-glyph="chevron-down"
      />
      <ChevronUpIcon
        data-ui-component="accordion"
        data-ui-part="accordion-expanded-icon"
        data-slot="accordion-trigger-icon"
        data-indicator-glyph="chevron-up"
      />
    {/if}
  </AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
