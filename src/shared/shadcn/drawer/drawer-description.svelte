<script lang="ts">
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DrawerPrimitive.DescriptionProps = $props();
</script>

<DrawerPrimitive.Description
	bind:ref
		data-ui-component="drawer"
	data-ui-part="drawer-description"
	data-slot="drawer-description"
	class={className}
	{...restProps}
/>
