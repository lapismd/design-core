<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import { type WithoutChild } from "../../../lib/utils.js";
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';

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

<AccordionPrimitive.Header {level}  data-ui-component="accordion"
 data-ui-part="accordion-header"
 data-slot="accordion-header"
 >
	<AccordionPrimitive.Trigger
				data-ui-component="accordion"
		data-ui-part="accordion-trigger"
		data-slot="accordion-trigger"
		bind:ref
		class={className}
		{...restProps}
	>
		{@render children?.()}
		<ChevronDownIcon  data-ui-component="accordion"
 data-ui-part="accordion-trigger-icon"
 data-slot="accordion-trigger-icon"  />
		<ChevronUpIcon  data-ui-component="accordion"
 data-ui-part="accordion-chevron-up-icon"
 data-slot="accordion-trigger-icon"  />
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
