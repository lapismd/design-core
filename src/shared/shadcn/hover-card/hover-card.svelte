<script lang="ts">
  import { LinkPreview as HoverCardPrimitive } from "bits-ui";
  import { setContext } from "svelte";
  import {
    createOverlayPortalContext,
    hoverCardPortalContextKey,
  } from "../../../lib/overlay-portal-context.js";

  let { open = $bindable(false), ...restProps }: HoverCardPrimitive.RootProps =
    $props();

  setContext(hoverCardPortalContextKey, createOverlayPortalContext());
</script>

<HoverCardPrimitive.Root bind:open {...restProps} />
