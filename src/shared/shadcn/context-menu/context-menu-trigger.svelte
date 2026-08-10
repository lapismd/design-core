<script lang="ts">
  import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
  import { getContext } from "svelte";
  import {
    contextMenuPortalContextKey,
    type OverlayPortalContext,
  } from "../../../lib/overlay-portal-context.js";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: ContextMenuPrimitive.TriggerProps = $props();

  const portalContext = getContext<OverlayPortalContext | undefined>(
    contextMenuPortalContextKey,
  );

  $effect(() => {
    if (portalContext)
      portalContext.portalTarget = ref?.ownerDocument.body ?? null;
  });
</script>

<ContextMenuPrimitive.Trigger
  bind:ref
  data-ui-component="context-menu"
  data-ui-part="context-menu-trigger"
  data-slot="context-menu-trigger"
  class={className}
  {...restProps}
/>
