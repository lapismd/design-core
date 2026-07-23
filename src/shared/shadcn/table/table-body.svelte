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

<tbody bind:this={ref}  {...restProps}
  data-ui-component="table"
 data-ui-part="table-body"
 data-slot="table-body" class={className}>
	{@render children?.()}
</tbody>
