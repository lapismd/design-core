<script lang="ts">
  import { Checkbox as CheckboxPrimitive } from "bits-ui";
  import { type WithoutChildrenOrChild } from "../../../lib/utils.js";
  import CheckIcon from "@lucide/svelte/icons/check";
  import MinusIcon from "@lucide/svelte/icons/minus";

  let {
    ref = $bindable(null),
    checked = $bindable(false),
    indeterminate = $bindable(false),
    class: className,
    ...restProps
  }: WithoutChildrenOrChild<CheckboxPrimitive.RootProps> = $props();
</script>

<CheckboxPrimitive.Root
  bind:ref
  data-ui-component="checkbox"
  data-ui-part="checkbox"
  data-slot="checkbox"
  class={className}
  bind:checked
  bind:indeterminate
  {...restProps}
>
  {#snippet children({ checked, indeterminate })}
    <div
      data-ui-component="checkbox"
      data-ui-part="checkbox-indicator"
      data-slot="checkbox-indicator"
    >
      {#if checked}
        <CheckIcon />
      {:else if indeterminate}
        <MinusIcon />
      {/if}
    </div>
  {/snippet}
</CheckboxPrimitive.Root>

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
      [data-ui-component="checkbox"][data-ui-part="checkbox"] {
        position: relative;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"] {
        display: flex;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox-indicator"] {
        display: grid;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"] {
        width: calc(var(--spacing) * 4);
        height: calc(var(--spacing) * 4);
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"] {
        flex-shrink: 0;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox-indicator"] {
        place-content: center;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"] {
        align-items: center;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"] {
        justify-content: center;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"] {
        border-radius: 4px;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"] {
        border-style: var(--tw-border-style);
        border-width: 1px;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"] {
        border-color: var(--input);
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox-indicator"] {
        color: currentColor;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"] {
        --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, #0000000d);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"] {
        transition-property: box-shadow;
        transition-timing-function: var(
          --tw-ease,
          var(--default-transition-timing-function)
        );
        transition-duration: var(
          --tw-duration,
          var(--default-transition-duration)
        );
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox-indicator"] {
        transition-property: none;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:is(
          :where(.group\/field):has(:disabled) *
        ) {
        opacity: 0.5;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:after {
        content: var(--tw-content);
        position: absolute;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:after {
        content: var(--tw-content);
        inset-inline: calc(var(--spacing) * -3);
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:after {
        content: var(--tw-content);
        inset-block: calc(var(--spacing) * -2);
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:focus-visible {
        border-color: var(--ring);
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:focus-visible {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:focus-visible {
        --tw-ring-color: var(--ring);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="checkbox"][data-ui-part="checkbox"]:focus-visible {
          --tw-ring-color: color-mix(in oklab, var(--ring) 50%, transparent);
        }
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:disabled {
        cursor: not-allowed;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:disabled {
        opacity: 0.5;
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"][aria-invalid="true"] {
        border-color: var(--destructive);
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"][aria-invalid="true"] {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"][aria-invalid="true"] {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="checkbox"][data-ui-part="checkbox"][aria-invalid="true"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 20%,
            transparent
          );
        }
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"][aria-invalid="true"][aria-checked="true"] {
        border-color: var(--primary);
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:is(
          :global(.dark) *
        ) {
        background-color: var(--input);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="checkbox"][data-ui-part="checkbox"]:is(
            :global(.dark) *
          ) {
          background-color: color-mix(in oklab, var(--input) 30%, transparent);
        }
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:is(
          :global(.dark) *
        )[aria-invalid="true"] {
        border-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="checkbox"][data-ui-part="checkbox"]:is(
            :global(.dark) *
          )[aria-invalid="true"] {
          border-color: color-mix(
            in oklab,
            var(--destructive) 50%,
            transparent
          );
        }
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:is(
          :global(.dark) *
        )[aria-invalid="true"] {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="checkbox"][data-ui-part="checkbox"]:is(
            :global(.dark) *
          )[aria-invalid="true"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 40%,
            transparent
          );
        }
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:where(
          [data-state="checked"]
        ),
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:where(
          [data-checked]:not([data-checked="false"])
        ) {
        border-color: var(--primary);
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:where(
          [data-state="checked"]
        ),
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:where(
          [data-checked]:not([data-checked="false"])
        ) {
        background-color: var(--primary);
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:where(
          [data-state="checked"]
        ),
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:where(
          [data-checked]:not([data-checked="false"])
        ) {
        color: var(--primary-foreground);
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:is(
          :global(.dark) *
        ):where([data-state="checked"]),
      [data-ui-component="checkbox"][data-ui-part="checkbox"]:is(
          :global(.dark) *
        ):where([data-checked]:not([data-checked="false"])) {
        background-color: var(--primary);
      }
      [data-ui-component="checkbox"][data-ui-part="checkbox-indicator"] > svg {
        width: calc(var(--spacing) * 3.5);
        height: calc(var(--spacing) * 3.5);
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
    @property --tw-content {
      syntax: "*";
      inherits: false;
      initial-value: "";
    }
  }
</style>
