export const Basic = `<script lang="ts">
  import { CyclePicker } from "@lapismd/design-core/forms";

  let theme = $state("moderncv");
  const themes = [
    { value: "classic", label: "Classic" },
    { value: "moderncv", label: "ModernCV" },
    { value: "opal", label: "Opal" },
  ];
</script>

<CyclePicker
  value={theme}
  options={themes}
  ariaLabel="Theme"
  onChange={(next) => (theme = next)}
/>`;
