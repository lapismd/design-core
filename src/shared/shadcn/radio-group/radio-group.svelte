<script lang="ts">
  import { RadioGroup as RadioGroupPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    value = $bindable(""),
    ...restProps
  }: RadioGroupPrimitive.RootProps = $props();
</script>

<RadioGroupPrimitive.Root
  bind:ref
  bind:value
  data-ui-component="radio-group"
  data-ui-part="radio-group"
  data-slot="radio-group"
  class={className}
  {...restProps}
/>

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
    [data-ui-component="radio-group"][data-ui-part="radio-group-circle-icon"] {
      position: absolute;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"] {
      position: relative;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-circle-icon"] {
      top: 50%;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-circle-icon"] {
      left: 50%;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"],
    [data-ui-component="radio-group"][data-ui-part="radio-group-indicator"] {
      display: flex;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group"] {
      display: grid;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"] {
      aspect-ratio: 1;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-circle-icon"] {
      width: calc(var(--spacing) * 2);
      height: calc(var(--spacing) * 2);
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"],
    [data-ui-component="radio-group"][data-ui-part="radio-group-indicator"] {
      width: calc(var(--spacing) * 4);
      height: calc(var(--spacing) * 4);
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group"] {
      width: 100%;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"] {
      flex-shrink: 0;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-circle-icon"] {
      --tw-translate-x: calc(calc(1 / 2 * 100%) * -1);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-circle-icon"] {
      --tw-translate-y: calc(calc(1 / 2 * 100%) * -1);
      translate: var(--tw-translate-x) var(--tw-translate-y);
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-indicator"] {
      align-items: center;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-indicator"] {
      justify-content: center;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group"] {
      gap: calc(var(--spacing) * 3);
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"],
    [data-ui-component="radio-group"][data-ui-part="radio-group-circle-icon"] {
      border-radius: 3.40282e38px;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"] {
      border-style: var(--tw-border-style);
      border-width: 1px;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"] {
      border-color: var(--ui-radio-group-border-color, var(--input));
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-circle-icon"] {
      background-color: var(--primary-foreground);
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"] {
      --tw-outline-style: none;
      outline-style: none;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:is(
        :where([data-slot="field-label"]):has(:focus-visible) *
      ) {
      --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
        calc(0px + var(--tw-ring-offset-width))
        var(--tw-ring-color, currentcolor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
        var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:is(
        :where([data-slot="field-label"]):has(:focus-visible) *
      ):not(
        :where([data-state="checked"]),
        :where([data-checked]:not([data-checked="false"]))
      ) {
      border-color: var(--ui-radio-group-border-color, var(--input));
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:after {
      content: var(--tw-content);
      position: absolute;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:after {
      content: var(--tw-content);
      inset-inline: calc(var(--spacing) * -3);
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:after {
      content: var(--tw-content);
      inset-block: calc(var(--spacing) * -2);
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:focus-visible {
      border-color: var(--ui-radio-group-focus-ring-color, var(--ring));
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:focus-visible {
      --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
        calc(3px + var(--tw-ring-offset-width))
        var(--tw-ring-color, currentcolor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
        var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:focus-visible {
      --tw-ring-color: var(--ui-radio-group-focus-ring-color, var(--ring));
    }
    @supports (color: color-mix(in lab, red, red)) {
      [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:focus-visible {
        --tw-ring-color: color-mix(
          in oklab,
          var(--ui-radio-group-focus-ring-color, var(--ring)) 50%,
          transparent
        );
      }
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:disabled {
      cursor: not-allowed;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:disabled {
      opacity: 0.5;
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"][aria-invalid="true"] {
      border-color: var(--destructive);
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"][aria-invalid="true"] {
      --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
        calc(3px + var(--tw-ring-offset-width))
        var(--tw-ring-color, currentcolor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
        var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"][aria-invalid="true"] {
      --tw-ring-color: var(--destructive);
    }
    @supports (color: color-mix(in lab, red, red)) {
      [data-ui-component="radio-group"][data-ui-part="radio-group-item"][aria-invalid="true"] {
        --tw-ring-color: color-mix(
          in oklab,
          var(--destructive) 20%,
          transparent
        );
      }
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"][aria-invalid="true"][aria-checked="true"] {
      border-color: var(--primary);
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:is(
        :global(.dark) *
      ) {
      background-color: var(--ui-radio-group-border-color, var(--input));
    }
    @supports (color: color-mix(in lab, red, red)) {
      [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:is(
          :global(.dark) *
        ) {
        background-color: color-mix(
          in oklab,
          var(--ui-radio-group-border-color, var(--input)) 30%,
          transparent
        );
      }
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:is(
        :global(.dark) *
      )[aria-invalid="true"] {
      border-color: var(--destructive);
    }
    @supports (color: color-mix(in lab, red, red)) {
      [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:is(
          :global(.dark) *
        )[aria-invalid="true"] {
        border-color: color-mix(in oklab, var(--destructive) 50%, transparent);
      }
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:is(
        :global(.dark) *
      )[aria-invalid="true"] {
      --tw-ring-color: var(--destructive);
    }
    @supports (color: color-mix(in lab, red, red)) {
      [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:is(
          :global(.dark) *
        )[aria-invalid="true"] {
        --tw-ring-color: color-mix(
          in oklab,
          var(--destructive) 40%,
          transparent
        );
      }
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:where(
        [data-state="checked"]
      ),
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:where(
        [data-checked]:not([data-checked="false"])
      ) {
      border-color: var(--ui-radio-group-background, var(--primary));
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:where(
        [data-state="checked"]
      ),
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:where(
        [data-checked]:not([data-checked="false"])
      ) {
      background-color: var(--ui-radio-group-background, var(--primary));
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:where(
        [data-state="checked"]
      ),
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:where(
        [data-checked]:not([data-checked="false"])
      ) {
      color: var(--primary-foreground);
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:is(
        :where([data-slot="field-label"]):has(:focus-visible) *
      ):where([data-state="checked"]),
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:is(
        :where([data-slot="field-label"]):has(:focus-visible) *
      ):where([data-checked]:not([data-checked="false"])) {
      border-color: var(--ui-radio-group-background, var(--primary));
    }
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:is(
        :global(.dark) *
      ):where([data-state="checked"]),
    [data-ui-component="radio-group"][data-ui-part="radio-group-item"]:is(
        :global(.dark) *
      ):where([data-checked]:not([data-checked="false"])) {
      background-color: var(--ui-radio-group-background, var(--primary));
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
    @property --tw-translate-x {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-translate-y {
      syntax: "*";
      inherits: false;
      initial-value: 0;
    }
    @property --tw-translate-z {
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
    @property --tw-content {
      syntax: "*";
      inherits: false;
      initial-value: "";
    }
  }
</style>
