<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLFieldsetAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLFieldsetAttributes> = $props();
</script>

<fieldset
  bind:this={ref}
  data-ui-component="field"
  data-ui-part="field-set"
    data-slot="field-set"
  class={className}
  {...restProps}
>
  {@render children?.()}
</fieldset>
