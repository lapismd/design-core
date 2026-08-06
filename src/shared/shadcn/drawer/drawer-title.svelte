<script lang="ts">
  import { Drawer as DrawerPrimitive } from "vaul-svelte";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: DrawerPrimitive.TitleProps = $props();
</script>

<DrawerPrimitive.Title
  bind:ref
  data-ui-component="drawer"
  data-ui-part="drawer-title"
  data-slot="drawer-title"
  class={className}
  {...restProps}
/>
