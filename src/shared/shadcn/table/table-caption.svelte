<script lang="ts">
	import { type WithElementRef } from "../../../lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<caption
	bind:this={ref}
		{...restProps}
  data-ui-component="table"
	data-ui-part="table-caption"
	data-slot="table-caption"
	class={className}
>
	{@render children?.()}
</caption>
