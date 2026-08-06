<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    inset,
    variant = "default",
    ...restProps
  }: ContextMenuPrimitive.ItemProps & {
    inset?: boolean;
    variant?: "default" | "destructive";
  } = $props();
</script>

<ContextMenuPrimitive.Item
  bind:ref
  data-ui-component="context-menu"
  data-ui-part="context-menu-item"
  data-slot="context-menu-item"
  data-inset={inset}
  data-variant={variant}
  class={className}
  {...restProps}
/>
