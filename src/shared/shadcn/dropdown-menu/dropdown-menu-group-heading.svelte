<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
    import type { ComponentProps } from "svelte";

  let {
    ref = $bindable(null),
    class: className,
    inset,
    ...restProps
  }: ComponentProps<typeof DropdownMenuPrimitive.GroupHeading> & {
    inset?: boolean;
  } = $props();
</script>

<DropdownMenuPrimitive.GroupHeading
  bind:ref
  data-ui-component="dropdown-menu"
  data-ui-part="dropdown-menu-group-heading"
    data-slot="dropdown-menu-group-heading"
  data-inset={inset}
  class={className}
  {...restProps}
/>
