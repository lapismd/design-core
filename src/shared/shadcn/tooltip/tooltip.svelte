<script lang="ts" generics="T = never">
  import { Tooltip as TooltipPrimitive } from "bits-ui";
  import { setContext } from "svelte";
  import {
    createOverlayPortalContext,
    tooltipPortalContextKey,
  } from "../../../lib/overlay-portal-context.js";

  let { open = $bindable(false), ...restProps }: TooltipPrimitive.RootProps<T> =
    $props();

  setContext(tooltipPortalContextKey, createOverlayPortalContext());
</script>

<TooltipPrimitive.Root bind:open {...restProps} />
