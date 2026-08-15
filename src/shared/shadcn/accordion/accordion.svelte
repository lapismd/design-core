<script lang="ts">
  import { Accordion as AccordionPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    ...restProps
  }: AccordionPrimitive.RootProps = $props();
</script>

<AccordionPrimitive.Root
  bind:ref
  bind:value={value as never}
  data-ui-component="accordion"
  data-ui-part="accordion"
  data-slot="accordion"
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
    @layer utilities {
      [data-ui-component="accordion"][data-ui-part="accordion-trigger-icon"],
      [data-ui-component="accordion"][data-ui-part="accordion-chevron-up-icon"] {
        pointer-events: none;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"] {
        position: relative;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-header"],
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"],
      [data-ui-component="accordion"][data-ui-part="accordion"] {
        display: flex;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-chevron-up-icon"] {
        display: none;
      }
      [data-ui-component="accordion"][data-ui-part="accordion"] {
        width: 100%;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"] {
        flex: 1;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger-icon"],
      [data-ui-component="accordion"][data-ui-part="accordion-chevron-up-icon"] {
        flex-shrink: 0;
      }
      [data-ui-component="accordion"][data-ui-part="accordion"] {
        flex-direction: column;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"] {
        align-items: flex-start;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"] {
        justify-content: space-between;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"][data-indicator-position="start"] {
        justify-content: flex-start;
        gap: calc(var(--spacing) * 2);
      }
      [data-ui-component="accordion"][data-ui-part="accordion-content"] {
        overflow: hidden;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"] {
        border-radius: calc(var(--radius) * 0.8);
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"] {
        border-style: var(--tw-border-style);
        border-width: 1px;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"] {
        border-color: #0000;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"] {
        padding-block: calc(var(--spacing) * 4);
      }
      [data-ui-component="accordion"][data-ui-part="accordion-content-anon-0"] {
        padding-top: 0;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-content-anon-0"] {
        padding-bottom: calc(var(--spacing) * 4);
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"] {
        text-align: left;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-content"],
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"] {
        font-size: var(--text-sm);
        line-height: var(--tw-leading, var(--text-sm--line-height));
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"] {
        --tw-font-weight: var(--font-weight-medium);
        font-weight: var(--font-weight-medium);
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"] {
        transition-property: all;
        transition-timing-function: var(
          --tw-ease,
          var(--default-transition-timing-function)
        );
        transition-duration: var(
          --tw-duration,
          var(--default-transition-duration)
        );
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-item"]:not(
          :last-child
        ) {
        border-bottom-style: var(--tw-border-style);
        border-bottom-width: 1px;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger-icon"]:is(
          :where(
              [data-ui-component="accordion"][data-ui-part="accordion-trigger"]
            )[aria-expanded="true"]
            *
        ) {
        display: none;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-chevron-up-icon"]:is(
          :where(
              [data-ui-component="accordion"][data-ui-part="accordion-trigger"]
            )[aria-expanded="true"]
            *
        ) {
        display: inline;
      }
      @media (hover: hover) {
        [data-ui-component="accordion"][data-ui-part="accordion-trigger"]:hover {
          text-decoration-line: underline;
        }
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"]:focus-visible {
        border-color: var(--ring);
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"]:focus-visible {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"]:focus-visible {
        --tw-ring-color: var(--ring);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="accordion"][data-ui-part="accordion-trigger"]:focus-visible {
          --tw-ring-color: color-mix(in oklab, var(--ring) 50%, transparent);
        }
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"]:focus-visible:after {
        content: var(--tw-content);
        border-color: var(--ring);
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"]:disabled {
        pointer-events: none;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-trigger"]:disabled {
        opacity: 0.5;
      }
      :is(
          [data-ui-component="accordion"][data-ui-part="accordion-trigger"] *
        )[data-slot="accordion-trigger-icon"] {
        margin-left: auto;
      }
      :is(
          [data-ui-component="accordion"][data-ui-part="accordion-trigger"][data-indicator-position="start"]
            *
        )[data-slot="accordion-trigger-icon"] {
        order: -1;
        margin-left: 0;
      }
      :is(
          [data-ui-component="accordion"][data-ui-part="accordion-trigger"] *
        )[data-slot="accordion-trigger-icon"] {
        width: calc(var(--spacing) * 4);
        height: calc(var(--spacing) * 4);
      }
      :is(
          [data-ui-component="accordion"][data-ui-part="accordion-trigger"] *
        )[data-slot="accordion-trigger-icon"] {
        color: var(--muted-foreground);
      }
      [data-ui-component="accordion"][data-ui-part="accordion-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="accordion"][data-ui-part="accordion-content"]:where(
          [data-open]:not([data-open="false"])
        ) {
        animation: accordion-down
          var(--tw-animation-duration, var(--tw-duration, 0.2s))
          var(--tw-ease, ease-out) var(--tw-animation-delay, 0s)
          var(--tw-animation-iteration-count, 1)
          var(--tw-animation-direction, normal)
          var(--tw-animation-fill-mode, none);
      }
      [data-ui-component="accordion"][data-ui-part="accordion-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="accordion"][data-ui-part="accordion-content"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        animation: accordion-up
          var(--tw-animation-duration, var(--tw-duration, 0.2s))
          var(--tw-ease, ease-out) var(--tw-animation-delay, 0s)
          var(--tw-animation-iteration-count, 1)
          var(--tw-animation-direction, normal)
          var(--tw-animation-fill-mode, none);
      }
      [data-ui-component="accordion"][data-ui-part="accordion-content-anon-0"]
        a {
        text-decoration-line: underline;
      }
      [data-ui-component="accordion"][data-ui-part="accordion-content-anon-0"]
        a {
        text-underline-offset: 3px;
      }
      @media (hover: hover) {
        [data-ui-component="accordion"][data-ui-part="accordion-content-anon-0"]
          a:hover {
          color: var(--ui-accordion-foreground, var(--foreground));
        }
      }
      [data-ui-component="accordion"][data-ui-part="accordion-content-anon-0"]
        p:not(:last-child) {
        margin-bottom: calc(var(--spacing) * 4);
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
    @property --tw-content {
      syntax: "*";
      inherits: false;
      initial-value: "";
    }
  }
</style>
