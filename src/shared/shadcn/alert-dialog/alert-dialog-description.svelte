<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
  
  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: AlertDialogPrimitive.DescriptionProps = $props();
</script>

<AlertDialogPrimitive.Description
  bind:ref
  data-ui-component="alert-dialog"
  data-ui-part="alert-dialog-description"
    data-slot="alert-dialog-description"
  class={className}
  {...restProps}
/>
