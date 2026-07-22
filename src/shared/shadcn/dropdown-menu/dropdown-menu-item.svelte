<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    inset,
    variant = "default",
    ...restProps
  }: DropdownMenuPrimitive.ItemProps & {
    inset?: boolean;
    variant?: "default" | "destructive";
  } = $props();
</script>

<DropdownMenuPrimitive.Item
  bind:ref
  data-ui-component="dropdown-menu"
  data-ui-part="dropdown-menu-item"
  data-slot="dropdown-menu-item"
  data-inset={inset}
  data-variant={variant}
  class={className}
  {...restProps}
/>
