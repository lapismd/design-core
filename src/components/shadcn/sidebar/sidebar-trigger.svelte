<script lang="ts">
  import { Button, type ButtonProps } from "../button/index.js";
  import { cn } from "../../../lib/utils.js";

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
  data-slot="sidebar-trigger"
  {variant}
  {size}
  class={cn(className)}
  {...restProps}
>
  {@render children?.()}
</Button>
