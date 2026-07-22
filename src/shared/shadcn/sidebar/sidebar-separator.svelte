<script lang="ts">
	import { Separator } from "../separator/index.js";
		import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ComponentProps<typeof Separator> = $props();
</script>

<Separator
	bind:ref
		data-ui-part="sidebar-separator"
	data-slot="sidebar-separator"
	data-sidebar="separator"
	class={className}
	{...restProps}
/>
