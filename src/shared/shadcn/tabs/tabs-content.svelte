<script lang="ts">
  import { Tabs as TabsPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: TabsPrimitive.ContentProps = $props();
</script>

<TabsPrimitive.Content
  bind:ref
  data-ui-component="tabs"
  data-ui-part="tabs-content"
  data-slot="tabs-content"
  class={className}
  {...restProps}
/>
