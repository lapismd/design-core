<script lang="ts">
  import { Collapsible as CollapsiblePrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    ...restProps
  }: CollapsiblePrimitive.ContentProps = $props();
</script>

<CollapsiblePrimitive.Content
  bind:ref
  data-ui-component="collapsible"
  data-ui-part="collapsible-content"
  data-slot="collapsible-content"
  {...restProps}
/>
