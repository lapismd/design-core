<script lang="ts">
  import * as ResizablePrimitive from "paneforge";
  import type { PaneAPI } from "paneforge";

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
  data-ui-component="resizable"
  data-ui-part="resizable-pane"
  data-slot="resizable-pane"
  class={className}
  {...restProps}
/>
