<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DropdownMenuPrimitive.SubContentProps = $props();
</script>

<DropdownMenuPrimitive.SubContent
	bind:ref
		data-ui-component="dropdown-menu"
	data-ui-part="dropdown-menu-sub-content"
	data-slot="dropdown-menu-sub-content"
	class={className}
	{...restProps}
/>
