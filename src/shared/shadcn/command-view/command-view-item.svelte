<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    children,
    child,
    role,
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
  {#snippet child({ props })}
    {#if child}
      {@render child({ props: { ...props, role: role ?? props.role } })}
    {:else}
      <div {...props} role={role ?? "option"}>
        {@render children?.()}
      </div>
    {/if}
  {/snippet}
</CommandPrimitive.Item>
