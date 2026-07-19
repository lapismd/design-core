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
    class="cn-command-item-indicator ml-auto opacity-0 group-has-[[data-slot=command-shortcut]]/command-item:hidden group-data-[checked=true]/command-item:opacity-100"
  />
</CommandPrimitive.Item>
