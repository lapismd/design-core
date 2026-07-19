<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
		import * as InputGroup from "../input-group/index.js";
	import SearchIcon from '@lucide/svelte/icons/search';

	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(""),
		...restProps
	}: CommandPrimitive.InputProps = $props();
</script>

<div  data-ui-component="command"
 data-ui-part="command-input-wrapper"
 data-slot="command-input-wrapper" >
	<InputGroup.Root  data-ui-component="command"
 data-ui-part="command-root"
 data-slot="command-root"
 >
		<CommandPrimitive.Input
			{value}
						data-ui-component="command"
			data-ui-part="command-input"
			data-slot="command-input"
			class={className}
			{...restProps}
		>
			{#snippet child({ props })}
				<InputGroup.Input {...props} bind:value bind:ref />
			{/snippet}
		</CommandPrimitive.Input>
		<InputGroup.Addon>
			<SearchIcon  data-ui-component="command"
 data-ui-part="command-search-icon"
 data-slot="command-search-icon"
  />
		</InputGroup.Addon>
	</InputGroup.Root>
</div>
