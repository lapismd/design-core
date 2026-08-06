<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    inset,
    ...restProps
  }: ContextMenuPrimitive.GroupHeadingProps & {
    inset?: boolean;
  } = $props();
</script>

<ContextMenuPrimitive.GroupHeading
  bind:ref
  data-ui-component="context-menu"
  data-ui-part="context-menu-group-heading"
  data-slot="context-menu-group-heading"
  data-inset={inset}
  class={className}
  {...restProps}
/>
