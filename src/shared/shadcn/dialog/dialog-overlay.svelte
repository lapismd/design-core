<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  
  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: DialogPrimitive.OverlayProps = $props();
</script>

<DialogPrimitive.Overlay
  bind:ref
  data-ui-component="dialog"
  data-ui-part="dialog-overlay"
    data-slot="dialog-overlay"
  class={className}
  {...restProps}
/>
