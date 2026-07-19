<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
	
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: AlertDialogPrimitive.TitleProps = $props();
</script>

<AlertDialogPrimitive.Title
	bind:ref
		data-ui-component="alert-dialog"
	data-ui-part="alert-dialog-title"
	data-slot="alert-dialog-title"
	class={className}
	{...restProps}
/>
