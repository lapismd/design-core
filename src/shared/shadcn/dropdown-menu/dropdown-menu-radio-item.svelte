<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import CheckIcon from '@lucide/svelte/icons/check';
	import { type WithoutChild } from "../../../lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children: childrenProp,
		...restProps
	}: WithoutChild<DropdownMenuPrimitive.RadioItemProps> = $props();
</script>

<DropdownMenuPrimitive.RadioItem
	bind:ref
		data-ui-component="dropdown-menu"
	data-ui-part="dropdown-menu-radio-item"
	data-slot="dropdown-menu-radio-item"
	class={className}
	{...restProps}
>
	{#snippet children({ checked })}
		<span
			
						data-ui-component="dropdown-menu"
			data-ui-part="dropdown-menu-radio-item-indicator"
			data-slot="dropdown-menu-radio-item-indicator"
		>
			{#if checked}
				<CheckIcon  />
			{/if}
		</span>
		{@render childrenProp?.({ checked })}
	{/snippet}
</DropdownMenuPrimitive.RadioItem>
