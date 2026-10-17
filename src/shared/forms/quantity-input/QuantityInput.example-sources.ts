export const Basic = `<script lang="ts">
 import { QuantityInput, bytesUnits } from "@lapismd/design-core/forms/quantity-input";
 let value=$state("1048576");
</script>
<QuantityInput id="capacity" label="Capacity" {value} units={bytesUnits} min={0} max={1073741824} preferredUnit="MiB" defaultValue={1048576} onValueChange={next=>value=next} />`;
