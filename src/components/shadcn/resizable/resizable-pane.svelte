<script lang="ts">
  import * as ResizablePrimitive from "paneforge";
  import type { PaneAPI } from "paneforge";
  import { cn } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    pane = $bindable<PaneAPI | null>(null),
    class: className,
    ...restProps
  }: ResizablePrimitive.PaneProps & {
    pane?: PaneAPI | null;
  } = $props();
</script>

<ResizablePrimitive.Pane
  bind:ref
  bind:this={pane}
  data-slot="resizable-pane"
  class={cn("min-h-0 min-w-0", className)}
  {...restProps}
/>
