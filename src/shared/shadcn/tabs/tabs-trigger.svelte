<script lang="ts">
  import { Tabs as TabsPrimitive } from "bits-ui";
  
  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: TabsPrimitive.TriggerProps = $props();
</script>

<TabsPrimitive.Trigger
  bind:ref
  data-ui-component="tabs"
  data-ui-part="tabs-trigger"
  data-slot="tabs-trigger"
  class={className}
  {...restProps}
/>
