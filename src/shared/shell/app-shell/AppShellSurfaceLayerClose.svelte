<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { Button } from "../../shadcn/button/index.js";
  import XIcon from "@lucide/svelte/icons/x";
  import { useSurfaceLayerContext } from "./app-shell-surface-layer-context.svelte.js";

  let {
    ref = $bindable(null),
    label,
    onclick,
    ...restProps
  }: HTMLButtonAttributes & {
    ref?: HTMLButtonElement | null;
    /** Accessible name; defaults to the containing layer's dismissal label. */
    label?: string;
  } = $props();
  const layer = useSurfaceLayerContext();
</script>

<Button
  bind:ref
  {...restProps}
  variant="ghost"
  size="icon-sm"
  data-ui-part="surface-layer-close"
  aria-label={label ?? layer.dismissLabel}
  title={label ?? layer.dismissLabel}
  onclick={(event) => {
    onclick?.(event);
    if (!event.defaultPrevented) layer.dismiss();
  }}><XIcon aria-hidden="true" /></Button
>
