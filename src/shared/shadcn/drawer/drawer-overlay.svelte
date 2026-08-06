<script lang="ts">
  import { Drawer as DrawerPrimitive } from "vaul-svelte";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: DrawerPrimitive.OverlayProps = $props();
</script>

<DrawerPrimitive.Overlay
  bind:ref
  data-ui-component="drawer"
  data-ui-part="drawer-overlay"
  data-slot="drawer-overlay"
  class={className}
  {...restProps}
/>
