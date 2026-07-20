<script lang="ts">
  let {
    label,
    value = "#000000",
    showLabel = true,
    placeholder = "",
    onChange,
  }: {
    label: string;
    value?: string;
    showLabel?: boolean;
    placeholder?: string;
    onChange: (value: string) => void;
  } = $props();

  const pickerValue = $derived(
    toPickerValue(value) ?? toPickerValue(placeholder) ?? "#000000",
  );

  function toPickerValue(input: string) {
    const trimmed = input.trim();
    const fullHex = /^#?([0-9a-f]{6})$/i.exec(trimmed);
    if (fullHex) return `#${fullHex[1].toLowerCase()}`;

    const shortHex = /^#?([0-9a-f]{3})$/i.exec(trimmed);
    if (shortHex) {
      return `#${shortHex[1]
        .split("")
        .map((part) => part + part)
        .join("")
        .toLowerCase()}`;
    }

    const rgb = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i.exec(
      trimmed,
    );
    if (!rgb) return null;
    const parts = rgb.slice(1, 4).map((part) => Number(part));
    if (parts.some((part) => part < 0 || part > 255)) return null;
    return `#${parts.map((part) => part.toString(16).padStart(2, "0")).join("")}`;
  }
</script>

<label class="flex min-w-0 items-center gap-2">
  {#if showLabel}
    <span class="text-muted-foreground text-xs font-medium">{label}</span>
  {/if}
  <input
    type="color"
    value={pickerValue}
    aria-label={`${label} color picker`}
    class="focus-visible:ring-ring size-7 shrink-0 cursor-pointer appearance-none rounded-full border-0 bg-transparent p-0 shadow-none focus-visible:ring-2 focus-visible:ring-offset-2"
    oninput={(event) => onChange(event.currentTarget.value)}
  />
  <input
    class="min-w-0 flex-1 border-0 bg-transparent px-0 py-0.5 font-mono text-sm outline-none"
    aria-label={`${label} hex`}
    {value}
    {placeholder}
    oninput={(event) => onChange(event.currentTarget.value)}
  />
</label>

<style>
  input[type="color"] {
    border: 0;
    border-radius: 9999px;
    background: transparent;
    overflow: hidden;
  }

  input[type="color"]::-webkit-color-swatch-wrapper {
    border: 0;
    border-radius: 9999px;
    padding: 0;
  }

  input[type="color"]::-webkit-color-swatch {
    border: 0;
    border-radius: 9999px;
  }

  input[type="color"]::-moz-color-swatch {
    border: 0;
    border-radius: 9999px;
  }
</style>
