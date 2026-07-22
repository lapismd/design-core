<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: CommandPrimitive.LinkItemProps = $props();
</script>

<CommandPrimitive.LinkItem
  bind:ref
  data-ui-component="command"
  data-ui-part="command-item"
  data-slot="command-item"
  class={className}
  {...restProps}
/>
