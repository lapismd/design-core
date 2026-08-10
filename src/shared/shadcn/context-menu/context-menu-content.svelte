<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
  import type { WithoutChildrenOrChild } from "../../../lib/utils.js";
  import ContextMenuPortal from "./context-menu-portal.svelte";
  import { getContext, type ComponentProps } from "svelte";
  import {
    contextMenuPortalContextKey,
    disableOverlayPortalContextKey,
    resolveOverlayPortalProps,
    type OverlayPortalContext,
  } from "../../../lib/overlay-portal-context.js";

  let {
    ref = $bindable(null),
    portalProps,
    class: className,
    ...restProps
  }: ContextMenuPrimitive.ContentProps & {
    portalProps?: WithoutChildrenOrChild<
      ComponentProps<typeof ContextMenuPortal>
    >;
  } = $props();

  const portalContext = getContext<OverlayPortalContext | undefined>(
    contextMenuPortalContextKey,
  );
  const disablePortals =
    getContext<boolean | undefined>(disableOverlayPortalContextKey) ?? false;
</script>

<ContextMenuPortal
  {...resolveOverlayPortalProps(portalContext, portalProps, disablePortals)}
>
  <ContextMenuPrimitive.Content
    bind:ref
    data-ui-component="context-menu"
    data-ui-part="context-menu-content"
    data-slot="context-menu-content"
    class={className}
    {...restProps}
  />
</ContextMenuPortal>
