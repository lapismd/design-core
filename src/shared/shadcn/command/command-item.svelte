<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";
  import CheckIcon from "@lucide/svelte/icons/check";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: CommandPrimitive.ItemProps = $props();
</script>

<CommandPrimitive.Item
  bind:ref
  data-ui-component="command"
  data-ui-part="command-item"
  data-slot="command-item"
  class={className}
  {...restProps}
>
  {@render children?.()}
  <CheckIcon
    data-ui-component="command"
    data-ui-part="command-check-icon"
    data-slot="command-check-icon"
  />
</CommandPrimitive.Item>
