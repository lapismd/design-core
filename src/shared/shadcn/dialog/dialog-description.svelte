<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  
  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: DialogPrimitive.DescriptionProps = $props();
</script>

<DialogPrimitive.Description
  bind:ref
  data-ui-component="dialog"
  data-ui-part="dialog-description"
    data-slot="dialog-description"
  class={className}
  {...restProps}
/>
