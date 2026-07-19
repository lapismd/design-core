<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";
	
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: AccordionPrimitive.ItemProps = $props();
</script>

<AccordionPrimitive.Item
	bind:ref
		data-ui-component="accordion"
	data-ui-part="accordion-item"
	data-slot="accordion-item"
	class={className}
	{...restProps}
/>
