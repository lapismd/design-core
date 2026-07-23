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

<thead
	bind:this={ref}
		{...restProps}
  data-ui-component="table"
	data-ui-part="table-header"
	data-slot="table-header"
	class={className}
>
	{@render children?.()}
</thead>
