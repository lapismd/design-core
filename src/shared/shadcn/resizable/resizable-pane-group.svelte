<script lang="ts">
  import * as ResizablePrimitive from "paneforge";
  
  let {
    ref = $bindable(null),
    this: paneGroup = $bindable(),
    class: className,
    ...restProps
  }: ResizablePrimitive.PaneGroupProps & {
    this?: ResizablePrimitive.PaneGroup;
  } = $props();
</script>

<ResizablePrimitive.PaneGroup
  bind:ref
  bind:this={paneGroup}
  data-ui-component="resizable"
  data-ui-part="resizable-pane-group"
    data-slot="resizable-pane-group"
  class={className}
  {...restProps}
/>
