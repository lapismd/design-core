<script lang="ts">
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
	
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ContextMenuPrimitive.TriggerProps = $props();
</script>

<ContextMenuPrimitive.Trigger
	bind:ref
	data-ui-component="context-menu"
	data-ui-part="context-menu-trigger"
		data-slot="context-menu-trigger"
	class={className}
	{...restProps}
/>
