<script lang="ts">
	import { cn, type WithElementRef } from '../../../lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="sidebar-content"
	class={cn('min-h-0 flex-1 overflow-y-auto px-4', className)}
	{...restProps}
>
	{@render children?.()}
</div>
