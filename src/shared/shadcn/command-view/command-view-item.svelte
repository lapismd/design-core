<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: CommandPrimitive.ItemProps = $props();
</script>

<CommandPrimitive.Item
  bind:ref
  data-ui-component="command-view"
  data-ui-part="item"
  data-slot="command-view-item"
  class={className}
  {...restProps}
>
  {@render children?.()}
</CommandPrimitive.Item>
