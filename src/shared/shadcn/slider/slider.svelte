<script lang="ts">
  import { Slider as SliderPrimitive } from "bits-ui";
  import { type WithoutChildrenOrChild } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    value = $bindable(),
    orientation = "horizontal",
    class: className,
    "aria-label": ariaLabel = undefined,
    "aria-labelledby": ariaLabelledby = undefined,
    ...restProps
  }: WithoutChildrenOrChild<SliderPrimitive.RootProps> = $props();
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<SliderPrimitive.Root
  bind:ref
  bind:value={value as never}
  data-ui-component="slider"
  data-ui-part="slider"
  data-slot="slider"
  {orientation}
  class={className}
  aria-label={ariaLabel}
  aria-labelledby={ariaLabelledby}
  {...restProps}
>
  {#snippet children({ thumbItems })}
    <span
      data-ui-component="slider"
      data-ui-part="slider-track"
      data-slot="slider-track"
      data-orientation={orientation}
    >
      <SliderPrimitive.Range
        data-ui-component="slider"
        data-ui-part="slider-range"
        data-slot="slider-range"
      />
    </span>
    {#each thumbItems as thumb (thumb.index)}
      <SliderPrimitive.Thumb
        data-ui-component="slider"
        data-ui-part="slider-thumb"
        data-slot="slider-thumb"
        index={thumb.index}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
      />
    {/each}
  {/snippet}
</SliderPrimitive.Root>

<style>
  /* Semantic selectors must be global: they target data attributes and descendants. */
  :global {
    /*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */
    @layer properties {
    }
    @layer base {
      @supports (not ((-webkit-appearance: -apple-pay-button))) or
        (contain-intrinsic-size: 1px) {
      }
    }
    [data-ui-component="slider"][data-ui-part="slider-range"] {
      position: absolute;
    }
    [data-ui-component="slider"][data-ui-part="slider"],
    [data-ui-component="slider"][data-ui-part="slider-track"] {
      position: relative;
    }
    [data-ui-component="slider"][data-ui-part="slider-thumb"] {
      display: block;
    }
    [data-ui-component="slider"][data-ui-part="slider"] {
      display: flex;
    }
    [data-ui-component="slider"][data-ui-part="slider-thumb"] {
      width: calc(var(--spacing) * 4);
      height: calc(var(--spacing) * 4);
    }
    [data-ui-component="slider"][data-ui-part="slider"] {
      width: 100%;
    }
    [data-ui-component="slider"][data-ui-part="slider-thumb"] {
      flex-shrink: 0;
    }
    [data-ui-component="slider"][data-ui-part="slider-track"] {
      flex-grow: 1;
    }
    [data-ui-component="slider"][data-ui-part="slider"] {
      touch-action: none;
    }
    [data-ui-component="slider"][data-ui-part="slider"] {
      align-items: center;
    }
    [data-ui-component="slider"][data-ui-part="slider-track"] {
      overflow: hidden;
    }
    [data-ui-component="slider"][data-ui-part="slider-track"],
    [data-ui-component="slider"][data-ui-part="slider-thumb"] {
      border-radius: 3.40282e38px;
    }
    [data-ui-component="slider"][data-ui-part="slider-thumb"] {
      border-style: var(--tw-border-style);
      border-width: 1px;
    }
    [data-ui-component="slider"][data-ui-part="slider-thumb"] {
      border-color: var(--primary);
    }
    [data-ui-component="slider"][data-ui-part="slider-track"] {
      background-color: var(--muted);
    }
    [data-ui-component="slider"][data-ui-part="slider-range"] {
      background-color: var(--primary);
    }
    [data-ui-component="slider"][data-ui-part="slider-thumb"] {
      background-color: var(--color-white);
    }
    [data-ui-component="slider"][data-ui-part="slider-thumb"] {
      --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, #0000001a),
        0 1px 2px -1px var(--tw-shadow-color, #0000001a);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
        var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
    [data-ui-component="slider"][data-ui-part="slider-thumb"] {
      --tw-ring-color: var(--ring);
    }
    @supports (color: color-mix(in lab, red, red)) {
      [data-ui-component="slider"][data-ui-part="slider-thumb"] {
        --tw-ring-color: color-mix(in oklab, var(--ring) 50%, transparent);
      }
    }
    [data-ui-component="slider"][data-ui-part="slider-thumb"] {
      transition-property: color, box-shadow;
      transition-timing-function: var(
        --tw-ease,
        var(--default-transition-timing-function)
      );
      transition-duration: var(
        --tw-duration,
        var(--default-transition-duration)
      );
    }
    [data-ui-component="slider"][data-ui-part="slider"],
    [data-ui-component="slider"][data-ui-part="slider-range"],
    [data-ui-component="slider"][data-ui-part="slider-thumb"] {
      -webkit-user-select: none;
      user-select: none;
    }
    @media (hover: hover) {
      [data-ui-component="slider"][data-ui-part="slider-thumb"]:hover {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(4px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
    }
    [data-ui-component="slider"][data-ui-part="slider-thumb"]:focus-visible {
      --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
        calc(4px + var(--tw-ring-offset-width))
        var(--tw-ring-color, currentcolor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
        var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
    [data-ui-component="slider"][data-ui-part="slider-thumb"]:focus-visible {
      --tw-outline-style: none;
      outline-style: none;
    }
    @media (forced-colors: active) {
      [data-ui-component="slider"][data-ui-part="slider-thumb"]:focus-visible {
        outline-offset: 2px;
        outline: 2px solid #0000;
      }
    }
    [data-ui-component="slider"][data-ui-part="slider-thumb"]:disabled {
      pointer-events: none;
    }
    [data-ui-component="slider"][data-ui-part="slider-thumb"]:disabled,
    [data-ui-component="slider"][data-ui-part="slider"]:where(
        [data-disabled="true"]
      ),
    [data-ui-component="slider"][data-ui-part="slider"]:where(
        [data-disabled]:not([data-disabled="false"])
      ) {
      opacity: 0.5;
    }
    [data-ui-component="slider"][data-ui-part="slider-track"]:where(
        [data-orientation="horizontal"]
      ) {
      height: calc(var(--spacing) * 1.5);
    }
    [data-ui-component="slider"][data-ui-part="slider-range"]:where(
        [data-orientation="horizontal"]
      ) {
      height: 100%;
    }
    [data-ui-component="slider"][data-ui-part="slider-track"]:where(
        [data-orientation="horizontal"]
      ) {
      width: 100%;
    }
    [data-ui-component="slider"][data-ui-part="slider"]:where(
        [data-orientation="vertical"]
      ),
    [data-ui-component="slider"][data-ui-part="slider-track"]:where(
        [data-orientation="vertical"]
      ) {
      height: 100%;
    }
    [data-ui-component="slider"][data-ui-part="slider"]:where(
        [data-orientation="vertical"]
      ) {
      min-height: calc(var(--spacing) * 40);
    }
    [data-ui-component="slider"][data-ui-part="slider-track"]:where(
        [data-orientation="vertical"]
      ) {
      width: calc(var(--spacing) * 1.5);
    }
    [data-ui-component="slider"][data-ui-part="slider"]:where(
        [data-orientation="vertical"]
      ) {
      width: auto;
    }
    [data-ui-component="slider"][data-ui-part="slider-range"]:where(
        [data-orientation="vertical"]
      ) {
      width: 100%;
    }
    [data-ui-component="slider"][data-ui-part="slider"]:where(
        [data-orientation="vertical"]
      ) {
      flex-direction: column;
    }
    @property --tw-animation-delay {
      syntax: "*";
      inherits: false;
      initial-value: 0s;
    }
    @property --tw-animation-direction {
      syntax: "*";
      inherits: false;
      initial-value: normal;
    }
    @property --tw-animation-duration {
      syntax: "*";
      inherits: false;
    }
    @property --tw-animation-fill-mode {
      syntax: "*";
      inherits: false;
      initial-value: none;
    }
    @property --tw-animation-iteration-count {
      syntax: "*";
      inherits: false;
      initial-value: 1;
    }
    @property --tw-enter-blur {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-enter-opacity {
      syntax: "*";
      inherits: false;
      initial-value: 1;
    }
    @property --tw-enter-rotate {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-enter-scale {
      syntax: "*";
      inherits: false;
      initial-value: 1;
    }
    @property --tw-enter-translate-x {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-enter-translate-y {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-exit-blur {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-exit-opacity {
      syntax: "*";
      inherits: false;
      initial-value: 1;
    }
    @property --tw-exit-rotate {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-exit-scale {
      syntax: "*";
      inherits: false;
      initial-value: 1;
    }
    @property --tw-exit-translate-x {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-exit-translate-y {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-border-style {
      syntax: "*";
      inherits: false;
      initial-value: solid;
    }
    @property --tw-shadow {
      syntax: "*";
      inherits: false;
      initial-value: 0 0 #0000;
    }
    @property --tw-shadow-color {
      syntax: "*";
      inherits: false;
    }
    @property --tw-shadow-alpha {
      syntax: "<percentage>";
      inherits: false;
      initial-value: 100%;
    }
    @property --tw-inset-shadow {
      syntax: "*";
      inherits: false;
      initial-value: 0 0 #0000;
    }
    @property --tw-inset-shadow-color {
      syntax: "*";
      inherits: false;
    }
    @property --tw-inset-shadow-alpha {
      syntax: "<percentage>";
      inherits: false;
      initial-value: 100%;
    }
    @property --tw-ring-color {
      syntax: "*";
      inherits: false;
    }
    @property --tw-ring-shadow {
      syntax: "*";
      inherits: false;
      initial-value: 0 0 #0000;
    }
    @property --tw-inset-ring-color {
      syntax: "*";
      inherits: false;
    }
    @property --tw-inset-ring-shadow {
      syntax: "*";
      inherits: false;
      initial-value: 0 0 #0000;
    }
    @property --tw-ring-inset {
      syntax: "*";
      inherits: false;
    }
    @property --tw-ring-offset-width {
      syntax: "<length>";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-ring-offset-color {
      syntax: "*";
      inherits: false;
      initial-value: #fff;
    }
    @property --tw-ring-offset-shadow {
      syntax: "*";
      inherits: false;
      initial-value: 0 0 #0000;
    }
  }
</style>
