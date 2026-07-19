<script lang="ts">
  import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
  import { getToggleGroupCtx } from "./toggle-group.svelte";
    import { type ToggleVariants, toggleVariants } from "../toggle/index.js";

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    size,
    variant,
    ...restProps
  }: ToggleGroupPrimitive.ItemProps & ToggleVariants = $props();

  const ctx = getToggleGroupCtx();
</script>

<ToggleGroupPrimitive.Item
  bind:ref
  data-ui-component="toggle-group"
  data-ui-part="toggle-group-item"
  data-slot="toggle-group-item"
  data-variant={ctx.variant || variant}
  data-size={ctx.size || size}
  data-spacing={ctx.spacing}
  class={className}
  {value}
  {...restProps}
/>
