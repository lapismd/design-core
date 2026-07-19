<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CommandPrimitive.SeparatorProps = $props();
</script>

<CommandPrimitive.Separator
	bind:ref
		data-ui-component="command"
	data-ui-part="command-separator"
	data-slot="command-separator"
	class={className}
	{...restProps}
/>
