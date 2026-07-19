<script lang="ts">
	import { type WithElementRef } from "../../../lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		variant = "legend",
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLLegendElement>> & {
		variant?: "legend" | "label";
	} = $props();
</script>

<legend
	bind:this={ref}
		data-ui-component="field"
	data-ui-part="field-legend"
	data-slot="field-legend"
	data-variant={variant}
	class={className}
	{...restProps}
>
	{@render children?.()}
</legend>
