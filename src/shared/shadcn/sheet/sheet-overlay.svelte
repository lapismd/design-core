<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: SheetPrimitive.OverlayProps = $props();
</script>

<SheetPrimitive.Overlay
	bind:ref
		data-ui-component="sheet"
	data-ui-part="sheet-overlay"
	data-slot="sheet-overlay"
	class={className}
	{...restProps}
/>
