<script lang="ts">
    import type { ComponentProps } from "svelte";
  import { Input } from "../input/index.js";

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    ...props
  }: ComponentProps<typeof Input> = $props();
</script>

<Input
  bind:ref
  data-ui-component="input-group"
  data-ui-part="input-group-input"
    data-slot="input-group-control"
  class={className}
  bind:value
  {...props}
/>
