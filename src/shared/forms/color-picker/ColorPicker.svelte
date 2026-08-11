<script lang="ts">
  import "./ColorPicker.css";
  import { Input } from "../../shadcn/input";
  import {
    colorValueForPicker,
    formatPickerColor,
    type ColorPickerFormat,
  } from "./color-value";

  let {
    value = "",
    placeholder = "",
    ariaLabel = "Color",
    format = "hex",
    error = null,
    onChange = () => {},
    onBlur = () => {},
  }: {
    value?: string;
    placeholder?: string;
    ariaLabel?: string;
    /** Controls how values chosen through the native swatch are serialized. */
    format?: ColorPickerFormat;
    error?: string | null;
    onChange?: (value: string) => void;
    onBlur?: () => void;
  } = $props();

  const pickerValue = $derived(
    colorValueForPicker(value) ?? colorValueForPicker(placeholder) ?? "#000000",
  );

  function updateFromPicker(nextValue: string) {
    onChange(formatPickerColor(nextValue, format));
  }
</script>

<div
  class="ui-color-picker"
  data-ui-component="color-picker"
  data-invalid={error ? "" : undefined}
>
  <input
    class="ui-color-picker__swatch"
    type="color"
    value={pickerValue}
    aria-label={`${ariaLabel} color picker`}
    aria-invalid={error ? "true" : undefined}
    oninput={(event) => updateFromPicker(event.currentTarget.value)}
    onblur={onBlur}
  />
  <Input
    class="ui-color-picker__value"
    {value}
    {placeholder}
    aria-label={`${ariaLabel} color value`}
    aria-invalid={error ? "true" : undefined}
    oninput={(event) => onChange(event.currentTarget.value)}
    onblur={onBlur}
  />
  {#if error}
    <p class="ui-color-picker__error" role="alert">{error}</p>
  {/if}
</div>
