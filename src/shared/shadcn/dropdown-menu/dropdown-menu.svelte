<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
  import { setContext } from "svelte";
  import {
    createOverlayPortalContext,
    dropdownMenuPortalContextKey,
  } from "../../../lib/overlay-portal-context.js";

  let {
    open = $bindable(false),
    ...restProps
  }: DropdownMenuPrimitive.RootProps = $props();

  setContext(dropdownMenuPortalContextKey, createOverlayPortalContext());
</script>

<DropdownMenuPrimitive.Root bind:open {...restProps} />
