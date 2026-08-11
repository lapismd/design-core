export const Basic = `<script lang="ts">
  import { ColorPicker } from "@lapismd/design-core/forms";

  let color = $state("004f90");
</script>

<ColorPicker
  value={color}
  ariaLabel="Name"
  format="hex-without-hash"
  onChange={(next) => (color = next)}
/>`;
