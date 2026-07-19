<script lang="ts">
		import { Textarea } from "../textarea/index.js";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...props
	}: ComponentProps<typeof Textarea> = $props();
</script>

<Textarea
	bind:ref
		data-ui-part="input-group-textarea"
	data-slot="input-group-control"
	class={className}
	bind:value
	{...props}
/>
