<script lang="ts">
  import { Button, type ButtonProps } from "../button/index.js";

  let {
    ref = $bindable(null),
    class: className,
    variant = "ghost",
    size = "icon-sm",
    children,
    ...restProps
  }: ButtonProps = $props();
</script>

<Button
  bind:ref
  data-ui-component="sidebar"
  data-ui-part="sidebar-trigger"
  data-slot="sidebar-trigger"
  {variant}
  {size}
  class={className}
  {...restProps}
>
  {@render children?.()}
</Button>
