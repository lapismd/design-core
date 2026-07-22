<script lang="ts">
  import { Label } from "../label/index.js";
  import type { ComponentProps } from "svelte";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: ComponentProps<typeof Label> = $props();
</script>

<Label
  bind:ref
  {...restProps}
  dataUiComponent="field"
  data-ui-part="field-label"
  data-slot="field-label"
  class={className}
>
  {@render children?.()}
</Label>
