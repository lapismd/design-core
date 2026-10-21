<script lang="ts">
  import QuantityInput from "./QuantityInput.svelte";
  import { bytesUnits } from "./quantity.js";
  let {
    disabled = false,
    large = false,
  }: { disabled?: boolean; large?: boolean } = $props();
  let value = $state("1048576"),
    edits = $state(0);
</script>

<div style="max-width:42rem">
  <QuantityInput
    id="capacity"
    label="Capacity"
    description="Canonical bytes with display units"
    {value}
    units={bytesUnits}
    preferredUnit="MiB"
    min={0}
    max={large ? Number.MAX_SAFE_INTEGER : 1073741824}
    defaultValue={1048576}
    {disabled}
    slider={large}
    onValueChange={(next) => {
      value = next;
      edits++;
    }}
  />
</div>
<p data-testid="quantity-value">{value}</p>
<p data-testid="quantity-edits">{edits}</p>
