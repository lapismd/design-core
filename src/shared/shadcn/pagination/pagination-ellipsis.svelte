<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { type WithElementRef, type WithoutChildren } from "../../../lib/utils.js";
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLSpanElement>>> = $props();
</script>

<span
	bind:this={ref}
	aria-hidden="true"
		{...restProps}
  data-ui-component="pagination"
	data-ui-part="pagination-ellipsis"
	data-slot="pagination-ellipsis"
	class={className}
>
	<MoreHorizontalIcon  />
	<span class="sr-only">More pages</span>
</span>
