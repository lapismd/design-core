<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
  
  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: AlertDialogPrimitive.OverlayProps = $props();
</script>

<AlertDialogPrimitive.Overlay
  bind:ref
  data-ui-component="alert-dialog"
  data-ui-part="alert-dialog-overlay"
    data-slot="alert-dialog-overlay"
  class={className}
  {...restProps}
/>
