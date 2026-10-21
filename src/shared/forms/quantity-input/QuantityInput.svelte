<script lang="ts">
  import * as Field from "../../shadcn/field/index.js";
  import * as InputGroup from "../../shadcn/input-group/index.js";
  import * as Select from "../../shadcn/select/index.js";
  import { Slider } from "../../shadcn/slider/index.js";
  import RotateCcw from "@lucide/svelte/icons/rotate-ccw";
  import CircleAlert from "@lucide/svelte/icons/circle-alert";
  import {
    canonicalNumericValue,
    validQuantityUnit,
    quantitySliderSteps,
    displayNumericValue,
    quantityError,
    type QuantityUnit,
  } from "./quantity.js";
  import "./quantity-input.css";

  let {
    id,
    label,
    description,
    value,
    units: suppliedUnits,
    preferredUnit,
    min,
    max,
    defaultValue,
    disabled = false,
    readonly = false,
    optional = false,
    error = "",
    slider = false,
    sliderMax,
    density = "regular",
    layout = "row",
    onValueChange,
    draft = $bindable(),
  }: {
    id: string;
    label: string;
    description?: string;
    value: string;
    units: readonly QuantityUnit[];
    preferredUnit?: string;
    min: number;
    max: number;
    defaultValue?: number;
    disabled?: boolean;
    readonly?: boolean;
    /** Empty retains an existing automatic/null setting. */
    optional?: boolean;
    error?: string;
    slider?: boolean;
    /** Convenience range; larger valid typed values expand it without edits. */
    sliderMax?: number;
    density?: "regular" | "compact";
    /** Control-only composition when the host already renders a labelled row. */
    layout?: "row" | "control";
    onValueChange: (canonical: string) => void;
    /** Retain this binding with the host draft across navigation; NaN marks invalid canonical values. */
    draft?: { canonical: string; text: string; unit: string } | undefined;
  } = $props();
  const units = $derived(
    suppliedUnits.length
      ? suppliedUnits
      : [{ id: "unit", label: "units", numerator: 1 }],
  );
  let selected = $state("");

  let input = $state<HTMLInputElement | null>(null);
  const unit = $derived(
    units.find((u) => u.id === (selected || preferredUnit)) ?? units[0]!,
  );
  const display = $derived(displayNumericValue(value, unit));
  const text = $derived(
    draft?.canonical === value && draft.unit === unit.id
      ? draft.text
      : display.text,
  );
  const validation = $derived(
    (!suppliedUnits.length ||
    suppliedUnits.some((unit) => !validQuantityUnit(unit))
      ? "Supply valid display units."
      : "") ||
      error ||
      (optional && !value.trim()
        ? ""
        : quantityError(value, min, max, units[0]!.label)),
  );
  const changed = $derived(
    defaultValue !== undefined &&
      (value.trim() === "" || Number(value) !== defaultValue),
  );
  const showExact = $derived(
    !!value.trim() && !validation && unit.id !== units[0]!.id,
  );
  const blocked = $derived(disabled || readonly);
  const sliderBound = $derived(
    Math.min(
      max,
      Math.max(min, sliderMax ?? max, validation ? min : Number(value)),
    ),
  );
  const sliderSteps = $derived(
    quantitySliderSteps(
      min,
      sliderBound,
      validation || !value.trim() ? undefined : Number(value),
    ),
  );
  const sliderMinimum = $derived(sliderLabel(min, true));
  const sliderMaximum = $derived(sliderLabel(sliderBound));
  const helpId = $derived(`${id}-help`);
  const stateId = $derived(`${id}-state`);
  const errorId = $derived(`${id}-error`);
  $effect(() => {
    input?.setCustomValidity(validation);
  });
  function update(text: string) {
    if (blocked) return;
    const canonical = canonicalNumericValue(text, unit);
    draft = { canonical, text, unit: unit.id };
    onValueChange(canonical);
  }
  function sliderLabel(bound: number, minimum = false) {
    const converted = displayNumericValue(String(bound), unit);
    const value = Number(converted.text);
    // A tiny minimum can read as zero; keep a nonzero maximum distinguishable.
    const text = value.toLocaleString(
      "en-GB",
      !minimum && value !== 0 && Math.abs(value) < 0.005
        ? { maximumSignificantDigits: 2 }
        : { maximumFractionDigits: 2 },
    );
    return `${text} ${unit.label}`;
  }
</script>

<div data-ui-component="quantity-input" data-layout={layout}>
  <Field.Field
    orientation="responsive"
    class="ui-quantity-input"
    data-density={density}
    data-invalid={validation ? true : undefined}
    data-disabled={disabled ? true : undefined}
  >
    {#if layout === "row"}<Field.Content>
        <Field.Label for={id}>{label}</Field.Label>
        {#if description}<Field.Description id={helpId}
            >{description}</Field.Description
          >{/if}
        {#if defaultValue !== undefined}<p class="ui-quantity-input__default">
            Default: {defaultValue.toLocaleString("en-GB")}
            {units[0]!.label}
          </p>{/if}
      </Field.Content>{/if}
    <div class="ui-quantity-input__controls">
      <div class="ui-quantity-input__entry">
        <InputGroup.Root class="ui-quantity-input__input" aria-label={label}>
          <InputGroup.Input
            bind:ref={input}
            {id}
            aria-label={label}
            type="number"
            required={!optional}
            step="any"
            min={Number(displayNumericValue(String(min), unit).text)}
            max={Number(displayNumericValue(String(max), unit).text)}
            {disabled}
            {readonly}
            value={text}
            aria-invalid={validation ? true : undefined}
            aria-describedby={`${description ? helpId : ""} ${showExact ? stateId : ""} ${validation ? errorId : ""}`.trim()}
            oninput={(event) => update(event.currentTarget.value)}
          />
          <InputGroup.Addon align="inline-end" class="ui-quantity-input__unit">
            {#if units.length > 1}
              <Select.Root
                type="single"
                value={unit.id}
                disabled={blocked}
                onValueChange={(next) => {
                  if (next) {
                    selected = next;
                    draft = undefined;
                  }
                }}
              >
                <Select.Trigger
                  aria-label={`${label} unit: ${unit.label}`}
                  class="ui-quantity-input__unit-trigger"
                  >{unit.label}</Select.Trigger
                >
                <Select.Content
                  ><Select.Group>
                    {#each units as option (option.id)}<Select.Item
                        value={option.id}
                        label={option.label}>{option.label}</Select.Item
                      >{/each}
                  </Select.Group></Select.Content
                >
              </Select.Root>
            {:else}<InputGroup.Text>{unit.label}</InputGroup.Text>{/if}
            {#if defaultValue !== undefined && changed}<InputGroup.Button
                type="button"
                variant="ghost"
                class="ui-quantity-input__reset"
                size="icon-sm"
                disabled={blocked}
                aria-label={`Reset ${label} to default`}
                title={`Reset to ${defaultValue.toLocaleString("en-GB")} ${units[0]!.label}`}
                onclick={() => {
                  draft = undefined;
                  input?.focus();
                  onValueChange(String(defaultValue));
                }}><RotateCcw aria-hidden="true" /></InputGroup.Button
              >{/if}
          </InputGroup.Addon>
        </InputGroup.Root>
      </div>
      {#if slider}
        <Slider
          type="single"
          {min}
          max={sliderBound}
          step={sliderSteps}
          value={validation || !value.trim() ? min : Number(value)}
          disabled={blocked || Boolean(validation)}
          aria-label={`${label} slider`}
          onValueChange={(next) => {
            const shown = validation || !value.trim() ? min : Number(value);
            if (!blocked && !validation && next !== shown) {
              draft = undefined;
              onValueChange(String(next));
            }
          }}
        />
        <div class="ui-quantity-input__range">
          <span>{sliderMinimum}</span><span>{sliderMaximum}</span>
        </div>
        {#if optional && !value.trim()}<p class="ui-quantity-input__state">
            No explicit value. Move the slider to choose a value.
          </p>{/if}
      {/if}
      {#if showExact}<p id={stateId} class="ui-quantity-input__state">
          {display.approximate
            ? "Approximate display; exact value: "
            : "Exact value: "}{Number(value).toLocaleString("en-GB")}
          {units[0]!.label}
        </p>{/if}
      {#if validation}<p
          id={errorId}
          class="ui-quantity-input__error"
          role="alert"
        >
          <CircleAlert aria-hidden="true" />{validation}
        </p>{/if}
    </div>
  </Field.Field>
</div>
