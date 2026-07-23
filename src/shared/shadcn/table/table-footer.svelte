<script lang="ts">
	import { type WithElementRef } from "../../../lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLTableSectionElement>> = $props();
</script>

<tfoot
	bind:this={ref}
		{...restProps}
  data-ui-component="table"
	data-ui-part="table-footer"
	data-slot="table-footer"
	class={className}
>
	{@render children?.()}
</tfoot>
