<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: SheetPrimitive.TitleProps = $props();
</script>

<SheetPrimitive.Title
	bind:ref
		data-ui-component="sheet"
	data-ui-part="sheet-title"
	data-slot="sheet-title"
	class={className}
	{...restProps}
/>
