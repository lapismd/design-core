<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: ContextMenuPrimitive.SeparatorProps = $props();
</script>

<ContextMenuPrimitive.Separator
  bind:ref
  data-ui-component="context-menu"
  data-ui-part="context-menu-separator"
  data-slot="context-menu-separator"
  class={className}
  {...restProps}
/>
