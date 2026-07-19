<script lang="ts">
	import { cn, type WithElementRef } from '../../../lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		open = $bindable(true),
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		open?: boolean;
	} = $props();
</script>

{#if open}
	<aside
		bind:this={ref}
		data-slot="sidebar"
		class={cn('w-72 shrink-0 bg-sidebar text-sidebar-foreground', className)}
		{...restProps}
	>
		{@render children?.()}
	</aside>
{/if}
