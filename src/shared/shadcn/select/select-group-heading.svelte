<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui";
  import type { ComponentProps } from "svelte";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: ComponentProps<typeof SelectPrimitive.GroupHeading> = $props();
</script>

<SelectPrimitive.GroupHeading
  bind:ref
  data-ui-component="select"
  data-ui-part="select-group-heading"
  data-slot="select-group-heading"
  class={className}
  {...restProps}
>
  {@render children?.()}
</SelectPrimitive.GroupHeading>
