<script lang="ts">
  import { Collapsible as CollapsiblePrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    ...restProps
  }: CollapsiblePrimitive.TriggerProps = $props();
</script>

<CollapsiblePrimitive.Trigger
  bind:ref
  data-ui-component="collapsible"
  data-ui-part="collapsible-trigger"
  data-slot="collapsible-trigger"
  {...restProps}
/>
