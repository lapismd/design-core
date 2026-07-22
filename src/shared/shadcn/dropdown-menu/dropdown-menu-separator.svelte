<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: DropdownMenuPrimitive.SeparatorProps = $props();
</script>

<DropdownMenuPrimitive.Separator
  bind:ref
  data-ui-component="dropdown-menu"
  data-ui-part="dropdown-menu-separator"
  data-slot="dropdown-menu-separator"
  class={className}
  {...restProps}
/>
