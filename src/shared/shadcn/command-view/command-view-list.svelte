<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";
  import { ScrollArea, type ScrollAreaStrategy } from "../scroll-area/index.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    scrollStrategy = "auto",
    ...restProps
  }: CommandPrimitive.ListProps & {
    /** Explicit host choice overrides the inherited scrolling strategy. */
    scrollStrategy?: ScrollAreaStrategy;
  } = $props();
</script>

<div
  data-ui-component="command-view"
  data-ui-part="list"
  data-slot="command-view-list"
  class={className}
>
  <ScrollArea {scrollStrategy}>
    <CommandPrimitive.List
      bind:ref
      data-ui-component="command-view"
      data-ui-part="command-list"
      data-slot="command-view-command-list"
      {...restProps}
    >
      <CommandPrimitive.Viewport
        data-ui-component="command-view"
        data-ui-part="viewport"
        data-slot="command-view-viewport"
      >
        {@render children?.()}
      </CommandPrimitive.Viewport>
    </CommandPrimitive.List>
  </ScrollArea>
</div>
