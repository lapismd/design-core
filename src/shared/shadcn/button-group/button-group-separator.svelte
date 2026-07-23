<script lang="ts">
		import type { ComponentProps } from "svelte";
	import { Separator } from "../separator/index.js";

	let {
		ref = $bindable(null),
		class: className,
		orientation = "vertical",
		...restProps
	}: ComponentProps<typeof Separator> = $props();
</script>

<Separator
	bind:ref
		data-ui-part="button-group-separator"
	data-slot="button-group-separator"
	{orientation}
	class={className}
	{...restProps}
/>
