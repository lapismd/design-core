<script lang="ts">
  import { LinkPreview as HoverCardPrimitive } from "bits-ui";
  import { getContext } from "svelte";
  import {
    hoverCardPortalContextKey,
    type OverlayPortalContext,
  } from "../../../lib/overlay-portal-context.js";

  let { ref = $bindable(null), ...restProps }: HoverCardPrimitive.TriggerProps =
    $props();

  const portalContext = getContext<OverlayPortalContext | undefined>(
    hoverCardPortalContextKey,
  );

  $effect(() => {
    if (portalContext)
      portalContext.portalTarget = ref?.ownerDocument.body ?? null;
  });
</script>

<HoverCardPrimitive.Trigger
  bind:ref
  data-slot="hover-card-trigger"
  {...restProps}
/>
