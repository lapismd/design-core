<script lang="ts">
	import type { HTMLOlAttributes } from "svelte/elements";
	import { type WithElementRef } from "../../../lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLOlAttributes> = $props();
</script>

<ol
	bind:this={ref}
		{...restProps}
  data-ui-component="breadcrumb"
	data-ui-part="breadcrumb-list"
	data-slot="breadcrumb-list"
	class={className}
>
	{@render children?.()}
</ol>
