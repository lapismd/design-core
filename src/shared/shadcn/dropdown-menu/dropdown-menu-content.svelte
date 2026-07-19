<script lang="ts">
  import { type WithoutChildrenOrChild } from "../../../lib/utils.js";
  import DropdownMenuPortal from "./dropdown-menu-portal.svelte";
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
  import type { ComponentProps } from "svelte";

  let {
    ref = $bindable(null),
    sideOffset = 4,
    align = "start",
    portalProps,
    class: className,
    ...restProps
  }: DropdownMenuPrimitive.ContentProps & {
    portalProps?: WithoutChildrenOrChild<
      ComponentProps<typeof DropdownMenuPortal>
    >;
  } = $props();
</script>

<DropdownMenuPortal {...portalProps}>
  <DropdownMenuPrimitive.Content
    bind:ref
    data-ui-component="dropdown-menu"
    data-ui-part="dropdown-menu-content"
        data-slot="dropdown-menu-content"
    {sideOffset}
    {align}
    class={className}
    {...restProps}
  />
</DropdownMenuPortal>
