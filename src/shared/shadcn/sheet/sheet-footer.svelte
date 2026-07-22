<script lang="ts">
	import { type WithElementRef } from "../../../lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
		{...restProps}
  data-ui-component="sheet"
	data-ui-part="sheet-footer"
	data-slot="sheet-footer"
	class={className}
>
	{@render children?.()}
</div>
