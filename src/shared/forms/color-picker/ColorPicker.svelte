<script lang="ts">
  import "./ColorPicker.css";
  import { Input } from "../../shadcn/input";
  import * as Popover from "../../shadcn/popover/index.js";
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
    presentation = "inline",
    presets = [],
    error = null,
    onChange = () => {},
    onBlur = () => {},
  }: {
    value?: string;
    placeholder?: string;
    ariaLabel?: string;
    /** Controls how values chosen through the native swatch are serialized. */
    format?: ColorPickerFormat;
    /** `popover` renders one circular trigger with an adjacent palette editor. */
    presentation?: "inline" | "popover";
    presets?: readonly string[];
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

  function selectPreset(nextValue: string) {
    updateFromPicker(colorValueForPicker(nextValue) ?? nextValue);
  }
</script>

{#if presentation === "popover"}
  <Popover.Root>
    <Popover.Trigger>
      {#snippet child({ props })}
        <button
          {...props}
          type="button"
          class="ui-color-picker__popover-trigger"
          aria-label={`${ariaLabel} color picker`}
          data-invalid={error ? "" : undefined}
          style={`--ui-color-picker-current: ${pickerValue}`}
        >
          <span aria-hidden="true"></span>
        </button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content
      class="ui-color-picker__popover-content"
      aria-label={`${ariaLabel} color palette`}
      align="start"
      sideOffset={6}
      collisionPadding={8}
    >
      <div
        class="ui-color-picker ui-color-picker--popover"
        data-ui-component="color-picker"
        data-presentation="popover"
        data-invalid={error ? "" : undefined}
      >
        {#if presets.length}
          <div
            class="ui-color-picker__presets"
            aria-label={`${ariaLabel} presets`}
          >
            {#each presets as preset (preset)}
              <button
                type="button"
                class="ui-color-picker__preset"
                aria-label={`Use ${preset}`}
                aria-pressed={colorValueForPicker(preset) === pickerValue}
                style={`--ui-color-picker-preset: ${colorValueForPicker(preset) ?? preset}`}
                onclick={() => selectPreset(preset)}
              ></button>
            {/each}
          </div>
        {/if}
        <div class="ui-color-picker__custom">
          <input
            class="ui-color-picker__swatch"
            type="color"
            value={pickerValue}
            aria-label={`${ariaLabel} any color`}
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
        </div>
        {#if error}
          <p class="ui-color-picker__error" role="alert">{error}</p>
        {/if}
      </div>
    </Popover.Content>
  </Popover.Root>
{:else}
  <div
    class="ui-color-picker"
    data-ui-component="color-picker"
    data-presentation="inline"
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
{/if}
