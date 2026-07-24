<script lang="ts">
  import "../cv-shared.css";

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

<label class="cv-color-control">
  {#if showLabel}
    <span class="cv-control-label">{label}</span>
  {/if}
  <input
    type="color"
    value={pickerValue}
    aria-label={`${label} color picker`}
    class="cv-color-control__picker"
    oninput={(event) => onChange(event.currentTarget.value)}
  />
  <input
    class="cv-color-control__hex"
    aria-label={`${label} hex`}
    {value}
    {placeholder}
    oninput={(event) => onChange(event.currentTarget.value)}
  />
</label>

<style>
  .cv-color-control {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.5rem;
  }

  .cv-color-control__picker {
    width: 1.75rem;
    height: 1.75rem;
    flex-shrink: 0;
    cursor: pointer;
    appearance: none;
    border: 0;
    border-radius: 9999px;
    background: transparent;
    padding: 0;
    box-shadow: none;
    overflow: hidden;
  }

  .cv-color-control__picker:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }

  .cv-color-control__picker::-webkit-color-swatch-wrapper {
    border: 0;
    border-radius: 9999px;
    padding: 0;
  }

  .cv-color-control__picker::-webkit-color-swatch {
    border: 0;
    border-radius: 9999px;
  }

  .cv-color-control__picker::-moz-color-swatch {
    border: 0;
    border-radius: 9999px;
  }

  .cv-color-control__hex {
    min-width: 0;
    flex: 1;
    border: 0;
    background: transparent;
    padding: 0.125rem 0;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 0.875rem;
    outline: none;
  }
</style>
