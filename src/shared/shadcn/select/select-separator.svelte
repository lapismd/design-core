<script lang="ts">
  import type { Separator as SeparatorPrimitive } from "bits-ui";
  import { Separator } from "../separator/index.js";
  
  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: SeparatorPrimitive.RootProps = $props();
</script>

<Separator
  bind:ref
  data-ui-component="select"
  data-ui-part="select-separator"
    data-slot="select-separator"
  class={className}
  {...restProps}
/>
