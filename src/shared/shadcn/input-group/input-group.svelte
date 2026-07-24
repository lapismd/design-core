<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...props
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  data-ui-component="input-group"
  data-ui-part="input-group"
  data-slot="input-group"
  role="group"
  class={className}
  {...props}
>
  {@render children?.()}
</div>

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
      [data-ui-component="input-group"][data-ui-part="input-group"] {
        position: relative;
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="inline-start"],
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="block-start"] {
        order: -9999;
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="inline-end"],
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="block-end"] {
        order: 9999;
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"],
      [data-ui-part="input-group-button"],
      [data-ui-component="input-group"][data-ui-part="input-group-text"],
      [data-ui-component="input-group"][data-ui-part="input-group"] {
        display: flex;
      }
      [data-ui-part="input-group-button"][data-size="icon-xs"] {
        width: calc(var(--spacing) * 6);
        height: calc(var(--spacing) * 6);
      }
      [data-ui-part="input-group-button"][data-size="icon-sm"] {
        width: calc(var(--spacing) * 8);
        height: calc(var(--spacing) * 8);
      }
      [data-ui-part="input-group-button"][data-size="xs"] {
        height: calc(var(--spacing) * 6);
      }
      [data-ui-component="input-group"][data-ui-part="input-group"] {
        height: calc(var(--spacing) * 9);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"] {
        height: auto;
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="block-start"],
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="block-end"],
      [data-ui-component="input-group"][data-ui-part="input-group"] {
        width: 100%;
      }
      [data-ui-component="input-group"][data-ui-part="input-group"] {
        min-width: 0;
      }
      [data-ui-part="input-group-input"][data-slot="input-group-control"],
      [data-ui-part="input-group-textarea"][data-slot="input-group-control"] {
        flex: 1;
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"] {
        cursor: text;
      }
      [data-ui-part="input-group-textarea"][data-slot="input-group-control"] {
        resize: none;
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"],
      [data-ui-part="input-group-button"],
      [data-ui-component="input-group"][data-ui-part="input-group-text"],
      [data-ui-component="input-group"][data-ui-part="input-group"] {
        align-items: center;
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"] {
        justify-content: center;
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="block-start"],
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="block-end"] {
        justify-content: flex-start;
      }
      [data-ui-part="input-group-button"][data-size="xs"] {
        gap: var(--spacing);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"],
      [data-ui-part="input-group-button"],
      [data-ui-component="input-group"][data-ui-part="input-group-text"] {
        gap: calc(var(--spacing) * 2);
      }
      [data-ui-part="input-group-button"][data-size="xs"],
      [data-ui-part="input-group-button"][data-size="icon-xs"] {
        border-radius: calc(var(--radius) - 5px);
      }
      [data-ui-component="input-group"][data-ui-part="input-group"] {
        border-radius: calc(var(--radius) * 0.8);
      }
      [data-ui-part="input-group-input"][data-slot="input-group-control"],
      [data-ui-part="input-group-textarea"][data-slot="input-group-control"] {
        border-radius: 0;
      }
      [data-ui-component="input-group"][data-ui-part="input-group"] {
        border-style: var(--tw-border-style);
        border-width: 1px;
      }
      [data-ui-part="input-group-input"][data-slot="input-group-control"],
      [data-ui-part="input-group-textarea"][data-slot="input-group-control"] {
        border-style: var(--tw-border-style);
        border-width: 0;
      }
      [data-ui-component="input-group"][data-ui-part="input-group"] {
        border-color: var(--ui-input-group-border-color, var(--input));
      }
      [data-ui-part="input-group-input"][data-slot="input-group-control"],
      [data-ui-part="input-group-textarea"][data-slot="input-group-control"] {
        background-color: #0000;
      }
      [data-ui-part="input-group-button"][data-size="icon-xs"],
      [data-ui-part="input-group-button"][data-size="icon-sm"] {
        padding: 0;
      }
      [data-ui-part="input-group-button"][data-size="xs"] {
        padding-inline: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="block-start"],
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="block-end"] {
        padding-inline: calc(var(--spacing) * 2.5);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"] {
        padding-block: calc(var(--spacing) * 1.5);
      }
      [data-ui-part="input-group-textarea"][data-slot="input-group-control"] {
        padding-block: calc(var(--spacing) * 2);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="block-start"] {
        padding-top: calc(var(--spacing) * 2);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="inline-end"] {
        padding-right: calc(var(--spacing) * 2);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="block-end"] {
        padding-bottom: calc(var(--spacing) * 2);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="inline-start"] {
        padding-left: calc(var(--spacing) * 2);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"],
      [data-ui-part="input-group-button"],
      [data-ui-component="input-group"][data-ui-part="input-group-text"] {
        font-size: var(--text-sm);
        line-height: var(--tw-leading, var(--text-sm--line-height));
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"] {
        --tw-font-weight: var(--font-weight-medium);
        font-weight: var(--font-weight-medium);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"],
      [data-ui-component="input-group"][data-ui-part="input-group-text"] {
        color: var(--muted-foreground);
      }
      [data-ui-part="input-group-button"],
      [data-ui-part="input-group-input"][data-slot="input-group-control"],
      [data-ui-part="input-group-textarea"][data-slot="input-group-control"] {
        --tw-shadow: 0 0 #0000;
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="input-group"][data-ui-part="input-group"] {
        --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, #0000000d);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-part="input-group-input"][data-slot="input-group-control"],
      [data-ui-part="input-group-textarea"][data-slot="input-group-control"] {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(0px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="input-group"][data-ui-part="input-group"] {
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
      [data-ui-component="input-group"][data-ui-part="input-group"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"] {
        -webkit-user-select: none;
        user-select: none;
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="block-start"]:is(
          :where(
              [data-ui-component="input-group"][data-ui-part="input-group"]
            ):has(> input)
            *
        ) {
        padding-top: calc(var(--spacing) * 2);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="block-end"]:is(
          :where(
              [data-ui-component="input-group"][data-ui-part="input-group"]
            ):has(> input)
            *
        ) {
        padding-bottom: calc(var(--spacing) * 2);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"]:is(
          :where(
              [data-ui-component="input-group"][data-ui-part="input-group"]
            )[data-disabled="true"]
            *
        ) {
        opacity: 0.5;
      }
      [data-ui-part="input-group-input"][data-slot="input-group-control"]:focus-visible,
      [data-ui-part="input-group-textarea"][data-slot="input-group-control"]:focus-visible {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(0px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      :where([data-slot="combobox-content"])
        [data-ui-component="input-group"][data-ui-part="input-group"]:focus-within {
        border-color: inherit;
      }
      :where([data-slot="combobox-content"])
        [data-ui-component="input-group"][data-ui-part="input-group"]:focus-within {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(0px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:has(
          [data-slot="input-group-control"]:focus-visible
        ) {
        border-color: var(--ui-input-group-focus-ring-color, var(--ring));
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:has(
          [data-slot="input-group-control"]:focus-visible
        ) {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:has(
          [data-slot="input-group-control"]:focus-visible
        ) {
        --tw-ring-color: var(--ui-input-group-focus-ring-color, var(--ring));
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="input-group"][data-ui-part="input-group"]:has(
            [data-slot="input-group-control"]:focus-visible
          ) {
          --tw-ring-color: color-mix(
            in oklab,
            var(--ui-input-group-focus-ring-color, var(--ring)) 50%,
            transparent
          );
        }
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:has(
          [data-slot][aria-invalid="true"]
        ) {
        border-color: var(--destructive);
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:has(
          [data-slot][aria-invalid="true"]
        ) {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:has(
          [data-slot][aria-invalid="true"]
        ) {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="input-group"][data-ui-part="input-group"]:has(
            [data-slot][aria-invalid="true"]
          ) {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 20%,
            transparent
          );
        }
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:has(
          > [data-align="block-end"]
        ) {
        height: auto;
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:has(
          > [data-align="block-end"]
        ) {
        flex-direction: column;
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:has(
          > [data-align="block-start"]
        ) {
        height: auto;
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:has(
          > [data-align="block-start"]
        ) {
        flex-direction: column;
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="inline-end"]:has(
          > button
        ) {
        margin-right: calc(var(--spacing) * -1);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="inline-start"]:has(
          > button
        ) {
        margin-left: calc(var(--spacing) * -1);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="inline-end"]:has(
          > kbd
        ) {
        margin-right: -0.15rem;
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="inline-start"]:has(
          > kbd
        ) {
        margin-left: -0.15rem;
      }
      [data-ui-part="input-group-button"][data-size="icon-xs"]:has(> svg),
      [data-ui-part="input-group-button"][data-size="icon-sm"]:has(> svg) {
        padding: 0;
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:has(
          > textarea
        ) {
        height: auto;
      }
      [data-ui-part="input-group-input"][data-slot="input-group-control"][aria-invalid="true"],
      [data-ui-part="input-group-textarea"][data-slot="input-group-control"][aria-invalid="true"] {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(0px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:is(
          :global(.dark) *
        ) {
        background-color: var(--input);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="input-group"][data-ui-part="input-group"]:is(
            :global(.dark) *
          ) {
          background-color: color-mix(in oklab, var(--input) 30%, transparent);
        }
      }
      [data-ui-part="input-group-input"][data-slot="input-group-control"]:is(
          :global(.dark) *
        ),
      [data-ui-part="input-group-textarea"][data-slot="input-group-control"]:is(
          :global(.dark) *
        ) {
        background-color: #0000;
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:is(
          :global(.dark) *
        ):has([data-slot][aria-invalid="true"]) {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="input-group"][data-ui-part="input-group"]:is(
            :global(.dark) *
          ):has([data-slot][aria-invalid="true"]) {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 40%,
            transparent
          );
        }
      }
      [data-ui-component="input-group"][data-ui-part="input-group-text"] svg {
        pointer-events: none;
      }
      [data-ui-component="input-group"][data-ui-part="input-group-text"]
        svg:not([class*="size-"]) {
        width: calc(var(--spacing) * 4);
        height: calc(var(--spacing) * 4);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="block-start"].border-b {
        padding-bottom: calc(var(--spacing) * 2);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"][data-align="block-end"].border-t {
        padding-top: calc(var(--spacing) * 2);
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:has(
          > [data-align="block-end"]
        )
        > input {
        padding-top: calc(var(--spacing) * 3);
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:has(
          > [data-align="block-start"]
        )
        > input {
        padding-bottom: calc(var(--spacing) * 3);
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:has(
          > [data-align="inline-end"]
        )
        > input {
        padding-right: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="input-group"][data-ui-part="input-group"]:has(
          > [data-align="inline-start"]
        )
        > input {
        padding-left: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"]
        > kbd {
        border-radius: calc(var(--radius) - 5px);
      }
      [data-ui-part="input-group-button"][data-size="xs"]
        > svg:not([class*="size-"]) {
        width: calc(var(--spacing) * 3.5);
        height: calc(var(--spacing) * 3.5);
      }
      [data-ui-component="input-group"][data-ui-part="input-group-addon"]
        > svg:not([class*="size-"]) {
        width: calc(var(--spacing) * 4);
        height: calc(var(--spacing) * 4);
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
    @property --tw-font-weight {
      syntax: "*";
      inherits: false;
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
