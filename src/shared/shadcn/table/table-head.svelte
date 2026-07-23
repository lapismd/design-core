<script lang="ts">
	import { type WithElementRef } from "../../../lib/utils.js";
	import type { HTMLThAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLThAttributes> = $props();
</script>

<th bind:this={ref}  {...restProps}
  data-ui-component="table"
 data-ui-part="table-head"
 data-slot="table-head" class={className}>
	{@render children?.()}
</th>
