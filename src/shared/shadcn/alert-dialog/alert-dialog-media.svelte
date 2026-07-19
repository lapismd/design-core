<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { type WithElementRef } from "../../../lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
		data-ui-component="alert-dialog"
	data-ui-part="alert-dialog-media"
	data-slot="alert-dialog-media"
	class={className}
	{...restProps}
>
	{@render children?.()}
</div>
