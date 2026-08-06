<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: ContextMenuPrimitive.SubContentProps = $props();
</script>

<ContextMenuPrimitive.SubContent
  bind:ref
  data-ui-component="context-menu"
  data-ui-part="context-menu-sub-content"
  data-slot="context-menu-sub-content"
  class={className}
  {...restProps}
/>
