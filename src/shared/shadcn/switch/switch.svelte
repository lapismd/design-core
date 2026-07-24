<script lang="ts">
  import { Switch as SwitchPrimitive } from "bits-ui";
  import { type WithoutChildrenOrChild } from "../../../lib/utils.js";
  import { omitDataUiIdentity } from "../../../lib/data-ui-host.js";

  let {
    ref = $bindable(null),
    class: className,
    checked = $bindable(false),
    size = "default",
    ...restProps
  }: WithoutChildrenOrChild<SwitchPrimitive.RootProps> & {
    size?: "sm" | "default";
  } = $props();
</script>

<SwitchPrimitive.Root
  bind:ref
  bind:checked
  {...omitDataUiIdentity(restProps)}
  data-ui-component="switch"
  data-ui-part="switch"
  data-slot="switch"
  data-size={size}
  class={className}
>
  <SwitchPrimitive.Thumb
    data-ui-component="switch"
    data-ui-part="switch-thumb"
    data-slot="switch-thumb"
  />
</SwitchPrimitive.Root>

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
      [data-ui-component="switch"][data-ui-part="switch-thumb"] {
        pointer-events: none;
      }
      [data-ui-component="switch"][data-ui-part="switch"] {
        position: relative;
      }
      [data-ui-component="switch"][data-ui-part="switch-thumb"] {
        display: block;
      }
      [data-ui-component="switch"][data-ui-part="switch"] {
        display: inline-flex;
      }
      [data-ui-component="switch"][data-ui-part="switch"] {
        flex-shrink: 0;
      }
      [data-ui-component="switch"][data-ui-part="switch"] {
        align-items: center;
      }
      [data-ui-component="switch"][data-ui-part="switch"],
      [data-ui-component="switch"][data-ui-part="switch-thumb"] {
        border-radius: 3.40282e38px;
      }
      [data-ui-component="switch"][data-ui-part="switch"] {
        border-style: var(--tw-border-style);
        border-width: 1px;
      }
      [data-ui-component="switch"][data-ui-part="switch"] {
        border-color: #0000;
      }
      [data-ui-component="switch"][data-ui-part="switch-thumb"] {
        background-color: var(--background);
      }
      [data-ui-component="switch"][data-ui-part="switch"] {
        --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, #0000000d);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="switch"][data-ui-part="switch-thumb"] {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(0px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="switch"][data-ui-part="switch"] {
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
      [data-ui-component="switch"][data-ui-part="switch-thumb"] {
        transition-property: transform, translate, scale, rotate;
        transition-timing-function: var(
          --tw-ease,
          var(--default-transition-timing-function)
        );
        transition-duration: var(
          --tw-duration,
          var(--default-transition-duration)
        );
      }
      [data-ui-component="switch"][data-ui-part="switch"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      [data-ui-component="switch"][data-ui-part="switch-thumb"]:is(
          :where(
              [data-ui-component="switch"][data-ui-part="switch"]
            )[data-size="default"]
            *
        ) {
        width: calc(var(--spacing) * 4);
        height: calc(var(--spacing) * 4);
      }
      [data-ui-component="switch"][data-ui-part="switch-thumb"]:is(
          :where(
              [data-ui-component="switch"][data-ui-part="switch"]
            )[data-size="sm"]
            *
        ) {
        width: calc(var(--spacing) * 3);
        height: calc(var(--spacing) * 3);
      }
      [data-ui-component="switch"][data-ui-part="switch"]:after {
        content: var(--tw-content);
        position: absolute;
      }
      [data-ui-component="switch"][data-ui-part="switch"]:after {
        content: var(--tw-content);
        inset-inline: calc(var(--spacing) * -3);
      }
      [data-ui-component="switch"][data-ui-part="switch"]:after {
        content: var(--tw-content);
        inset-block: calc(var(--spacing) * -2);
      }
      [data-ui-component="switch"][data-ui-part="switch"]:focus-visible {
        border-color: var(--ui-switch-focus-ring-color, var(--ring));
      }
      [data-ui-component="switch"][data-ui-part="switch"]:focus-visible {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="switch"][data-ui-part="switch"]:focus-visible {
        --tw-ring-color: var(--ui-switch-focus-ring-color, var(--ring));
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="switch"][data-ui-part="switch"]:focus-visible {
          --tw-ring-color: color-mix(
            in oklab,
            var(--ui-switch-focus-ring-color, var(--ring)) 50%,
            transparent
          );
        }
      }
      [data-ui-component="switch"][data-ui-part="switch"][aria-invalid="true"] {
        border-color: var(--destructive);
      }
      [data-ui-component="switch"][data-ui-part="switch"][aria-invalid="true"] {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="switch"][data-ui-part="switch"][aria-invalid="true"] {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="switch"][data-ui-part="switch"][aria-invalid="true"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 20%,
            transparent
          );
        }
      }
      [data-ui-component="switch"][data-ui-part="switch"][data-size="default"] {
        height: 18.4px;
      }
      [data-ui-component="switch"][data-ui-part="switch"][data-size="default"] {
        width: 32px;
      }
      [data-ui-component="switch"][data-ui-part="switch"][data-size="sm"] {
        height: 14px;
      }
      [data-ui-component="switch"][data-ui-part="switch"][data-size="sm"] {
        width: 24px;
      }
      [data-ui-component="switch"][data-ui-part="switch-thumb"]:where(
          :dir(rtl),
          [dir="rtl"],
          [dir="rtl"] *
        )[data-state="checked"] {
        --tw-translate-x: calc(-100%);
        translate: var(--tw-translate-x) var(--tw-translate-y);
      }
      [data-ui-component="switch"][data-ui-part="switch"]:is(
          :global(.dark) *
        )[aria-invalid="true"] {
        border-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="switch"][data-ui-part="switch"]:is(
            :global(.dark) *
          )[aria-invalid="true"] {
          border-color: color-mix(
            in oklab,
            var(--destructive) 50%,
            transparent
          );
        }
      }
      [data-ui-component="switch"][data-ui-part="switch"]:is(
          :global(.dark) *
        )[aria-invalid="true"] {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="switch"][data-ui-part="switch"]:is(
            :global(.dark) *
          )[aria-invalid="true"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 40%,
            transparent
          );
        }
      }
      [data-ui-component="switch"][data-ui-part="switch"]:where(
          [data-state="checked"]
        ),
      [data-ui-component="switch"][data-ui-part="switch"]:where(
          [data-checked]:not([data-checked="false"])
        ) {
        background-color: var(--primary);
      }
      [data-ui-component="switch"][data-ui-part="switch-thumb"]:is(
          :where(
              [data-ui-component="switch"][data-ui-part="switch"]
            )[data-size="default"]
            *
        ):where([data-state="checked"]),
      [data-ui-component="switch"][data-ui-part="switch-thumb"]:is(
          :where(
              [data-ui-component="switch"][data-ui-part="switch"]
            )[data-size="default"]
            *
        ):where([data-checked]:not([data-checked="false"])),
      [data-ui-component="switch"][data-ui-part="switch-thumb"]:is(
          :where(
              [data-ui-component="switch"][data-ui-part="switch"]
            )[data-size="sm"]
            *
        ):where([data-state="checked"]),
      [data-ui-component="switch"][data-ui-part="switch-thumb"]:is(
          :where(
              [data-ui-component="switch"][data-ui-part="switch"]
            )[data-size="sm"]
            *
        ):where([data-checked]:not([data-checked="false"])) {
        --tw-translate-x: calc(100% - 2px);
        translate: var(--tw-translate-x) var(--tw-translate-y);
      }
      [data-ui-component="switch"][data-ui-part="switch-thumb"]:is(
          :global(.dark) *
        ):where([data-state="checked"]),
      [data-ui-component="switch"][data-ui-part="switch-thumb"]:is(
          :global(.dark) *
        ):where([data-checked]:not([data-checked="false"])) {
        background-color: var(--primary-foreground);
      }
      [data-ui-component="switch"][data-ui-part="switch"]:where(
          [data-state="unchecked"]
        ),
      [data-ui-component="switch"][data-ui-part="switch"]:where(
          [data-unchecked]:not([data-unchecked="false"])
        ) {
        background-color: var(--ui-switch-background, var(--input));
      }
      [data-ui-component="switch"][data-ui-part="switch-thumb"]:is(
          :where(
              [data-ui-component="switch"][data-ui-part="switch"]
            )[data-size="default"]
            *
        ):where([data-state="unchecked"]),
      [data-ui-component="switch"][data-ui-part="switch-thumb"]:is(
          :where(
              [data-ui-component="switch"][data-ui-part="switch"]
            )[data-size="default"]
            *
        ):where([data-unchecked]:not([data-unchecked="false"])),
      [data-ui-component="switch"][data-ui-part="switch-thumb"]:is(
          :where(
              [data-ui-component="switch"][data-ui-part="switch"]
            )[data-size="sm"]
            *
        ):where([data-state="unchecked"]),
      [data-ui-component="switch"][data-ui-part="switch-thumb"]:is(
          :where(
              [data-ui-component="switch"][data-ui-part="switch"]
            )[data-size="sm"]
            *
        ):where([data-unchecked]:not([data-unchecked="false"])) {
        --tw-translate-x: 0px;
        translate: var(--tw-translate-x) var(--tw-translate-y);
      }
      [data-ui-component="switch"][data-ui-part="switch-thumb"]:is(
          :global(.dark) *
        ):where([data-state="unchecked"]),
      [data-ui-component="switch"][data-ui-part="switch-thumb"]:is(
          :global(.dark) *
        ):where([data-unchecked]:not([data-unchecked="false"])) {
        background-color: var(--foreground);
      }
      [data-ui-component="switch"][data-ui-part="switch"]:is(
          :global(.dark) *
        ):where([data-state="unchecked"]),
      [data-ui-component="switch"][data-ui-part="switch"]:is(
          :global(.dark) *
        ):where([data-unchecked]:not([data-unchecked="false"])) {
        background-color: var(--ui-switch-background, var(--input));
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="switch"][data-ui-part="switch"]:is(
            :global(.dark) *
          ):where([data-state="unchecked"]),
        [data-ui-component="switch"][data-ui-part="switch"]:is(
            :global(.dark) *
          ):where([data-unchecked]:not([data-unchecked="false"])) {
          background-color: color-mix(
            in oklab,
            var(--ui-switch-background, var(--input)) 80%,
            transparent
          );
        }
      }
      [data-ui-component="switch"][data-ui-part="switch"]:where(
          [data-disabled="true"]
        ),
      [data-ui-component="switch"][data-ui-part="switch"]:where(
          [data-disabled]:not([data-disabled="false"])
        ) {
        cursor: not-allowed;
      }
      [data-ui-component="switch"][data-ui-part="switch"]:where(
          [data-disabled="true"]
        ),
      [data-ui-component="switch"][data-ui-part="switch"]:where(
          [data-disabled]:not([data-disabled="false"])
        ) {
        opacity: 0.5;
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
  }
</style>
