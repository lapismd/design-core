<script lang="ts">
  import {
    type WithElementRef,
    type WithoutChildren,
  } from "../../../lib/utils.js";
  import type { HTMLTextareaAttributes } from "svelte/elements";
  import { omitDataUiComponent } from "../../../lib/data-ui-host.js";

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    "data-slot": dataSlot = "textarea",
    ...restProps
  }: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> = $props();
</script>

<textarea
  bind:this={ref}
  {...omitDataUiComponent(restProps)}
  data-ui-component="textarea"
  data-slot={dataSlot}
  class={className}
  bind:value
></textarea>

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
    @layer utilities {
      [data-ui-component="textarea"] {
        display: flex;
      }
      [data-ui-component="textarea"] {
        field-sizing: content;
      }
      [data-ui-component="textarea"] {
        min-height: calc(var(--spacing) * 16);
      }
      [data-ui-component="textarea"] {
        width: 100%;
      }
      [data-ui-component="textarea"] {
        border-radius: calc(var(--radius) * 0.8);
      }
      [data-ui-component="textarea"] {
        border-style: var(--tw-border-style);
        border-width: 1px;
      }
      [data-ui-component="textarea"] {
        border-color: var(--input);
      }
      [data-ui-component="textarea"] {
        background-color: #0000;
      }
      [data-ui-component="textarea"] {
        padding-inline: calc(var(--spacing) * 2.5);
      }
      [data-ui-component="textarea"] {
        padding-block: calc(var(--spacing) * 2);
      }
      [data-ui-component="textarea"] {
        font-size: var(--text-base);
        line-height: var(--tw-leading, var(--text-base--line-height));
      }
      [data-ui-component="textarea"] {
        --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, #0000000d);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="textarea"] {
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
      [data-ui-component="textarea"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      [data-ui-component="textarea"]::placeholder {
        color: var(--muted-foreground);
      }
      [data-ui-component="textarea"]:focus-visible {
        border-color: var(--ring);
      }
      [data-ui-component="textarea"]:focus-visible {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="textarea"]:focus-visible {
        --tw-ring-color: var(--ring);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="textarea"]:focus-visible {
          --tw-ring-color: color-mix(in oklab, var(--ring) 50%, transparent);
        }
      }
      [data-ui-component="textarea"]:disabled {
        cursor: not-allowed;
      }
      [data-ui-component="textarea"]:disabled {
        opacity: 0.5;
      }
      [data-ui-component="textarea"][aria-invalid="true"] {
        border-color: var(--destructive);
      }
      [data-ui-component="textarea"][aria-invalid="true"] {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="textarea"][aria-invalid="true"] {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="textarea"][aria-invalid="true"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 20%,
            transparent
          );
        }
      }
      @media (min-width: 48rem) {
        [data-ui-component="textarea"] {
          font-size: var(--text-sm);
          line-height: var(--tw-leading, var(--text-sm--line-height));
        }
      }
      [data-ui-component="textarea"]:is(:global(.dark) *) {
        background-color: var(--input);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="textarea"]:is(:global(.dark) *) {
          background-color: color-mix(in oklab, var(--input) 30%, transparent);
        }
      }
      [data-ui-component="textarea"]:is(:global(.dark) *)[aria-invalid="true"] {
        border-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="textarea"]:is(
            :global(.dark) *
          )[aria-invalid="true"] {
          border-color: color-mix(
            in oklab,
            var(--destructive) 50%,
            transparent
          );
        }
      }
      [data-ui-component="textarea"]:is(:global(.dark) *)[aria-invalid="true"] {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="textarea"]:is(
            :global(.dark) *
          )[aria-invalid="true"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 40%,
            transparent
          );
        }
      }
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
