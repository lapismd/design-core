<script lang="ts">
	import type { HTMLLiAttributes } from "svelte/elements";
	import { type WithElementRef } from "../../../lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLLiAttributes> = $props();
</script>

<li
	bind:this={ref}
		{...restProps}
  data-ui-component="breadcrumb"
	data-ui-part="breadcrumb-item"
	data-slot="breadcrumb-item"
	class={className}
>
	{@render children?.()}
</li>
