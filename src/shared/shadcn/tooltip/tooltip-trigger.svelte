<script lang="ts" generics="T = never">
  import { Tooltip as TooltipPrimitive } from "bits-ui";
  import { getContext } from "svelte";
  import {
    tooltipPortalContextKey,
    type OverlayPortalContext,
  } from "../../../lib/overlay-portal-context.js";

  let {
    ref = $bindable(null),
    ...restProps
  }: TooltipPrimitive.TriggerProps<T> = $props();

  const portalContext = getContext<OverlayPortalContext | undefined>(
    tooltipPortalContextKey,
  );

  $effect(() => {
    if (portalContext)
      portalContext.portalTarget = ref?.ownerDocument.body ?? null;
  });
</script>

<TooltipPrimitive.Trigger bind:ref data-slot="tooltip-trigger" {...restProps} />
