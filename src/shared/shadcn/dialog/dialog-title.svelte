<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: DialogPrimitive.TitleProps = $props();
</script>

<DialogPrimitive.Title
  bind:ref
  data-ui-component="dialog"
  data-ui-part="dialog-title"
  data-slot="dialog-title"
  class={className}
  {...restProps}
/>
