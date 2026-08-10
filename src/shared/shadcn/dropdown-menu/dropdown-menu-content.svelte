<script lang="ts">
  import { type WithoutChildrenOrChild } from "../../../lib/utils.js";
  import DropdownMenuPortal from "./dropdown-menu-portal.svelte";
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
  import { getContext, type ComponentProps } from "svelte";
  import { omitDataUiIdentity } from "../../../lib/data-ui-host.js";
  import {
    disableOverlayPortalContextKey,
    dropdownMenuPortalContextKey,
    resolveOverlayPortalProps,
    type OverlayPortalContext,
  } from "../../../lib/overlay-portal-context.js";

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

  const portalContext = getContext<OverlayPortalContext | undefined>(
    dropdownMenuPortalContextKey,
  );
  const disablePortals =
    getContext<boolean | undefined>(disableOverlayPortalContextKey) ?? false;
</script>

<DropdownMenuPortal
  {...resolveOverlayPortalProps(portalContext, portalProps, disablePortals)}
>
  <DropdownMenuPrimitive.Content
    bind:ref
    {...omitDataUiIdentity(restProps)}
    data-ui-component="dropdown-menu"
    data-ui-part="dropdown-menu-content"
    data-slot="dropdown-menu-content"
    {sideOffset}
    {align}
    class={className}
  />
</DropdownMenuPortal>
