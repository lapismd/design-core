<script lang="ts">
  import { Dialog as SheetPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: SheetPrimitive.DescriptionProps = $props();
</script>

<SheetPrimitive.Description
  bind:ref
  data-ui-component="sheet"
  data-ui-part="sheet-description"
  data-slot="sheet-description"
  class={className}
  {...restProps}
/>
