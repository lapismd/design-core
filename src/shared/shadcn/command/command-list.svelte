<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";
  
  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: CommandPrimitive.ListProps = $props();
</script>

<CommandPrimitive.List
  bind:ref
  data-ui-component="command"
  data-ui-part="command-list"
    data-slot="command-list"
  class={className}
  {...restProps}
/>
