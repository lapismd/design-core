<script lang="ts">
  import { Popover as PopoverPrimitive } from "bits-ui";
  import PopoverPortal from "./popover-portal.svelte";
  import { type WithoutChildrenOrChild } from "../../../lib/utils.js";
  import type { ComponentProps } from "svelte";

  let {
    ref = $bindable(null),
    class: className,
    sideOffset = 4,
    align = "center",
    portalProps,
    ...restProps
  }: PopoverPrimitive.ContentProps & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof PopoverPortal>>;
  } = $props();
</script>

<PopoverPortal {...portalProps}>
  <PopoverPrimitive.Content
    bind:ref
    data-ui-component="popover"
    data-ui-part="popover-content"
    data-slot="popover-content"
    {sideOffset}
    {align}
    class={className}
    {...restProps}
  />
</PopoverPortal>

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
      [data-ui-component="popover"][data-ui-part="popover-content"] {
        z-index: 50;
      }
      [data-ui-component="popover"][data-ui-part="popover-content"],
      [data-ui-component="popover"][data-ui-part="popover-header"] {
        display: flex;
      }
      [data-ui-component="popover"][data-ui-part="popover-content"] {
        width: calc(var(--spacing) * 72);
      }
      [data-ui-component="popover"][data-ui-part="popover-content"] {
        transform-origin: var(--transform-origin);
      }
      [data-ui-component="popover"][data-ui-part="popover-content"],
      [data-ui-component="popover"][data-ui-part="popover-header"] {
        flex-direction: column;
      }
      [data-ui-component="popover"][data-ui-part="popover-header"] {
        gap: var(--spacing);
      }
      [data-ui-component="popover"][data-ui-part="popover-content"] {
        gap: calc(var(--spacing) * 4);
      }
      [data-ui-component="popover"][data-ui-part="popover-content"] {
        border-radius: calc(var(--radius) * 0.8);
      }
      [data-ui-component="popover"][data-ui-part="popover-content"] {
        background-color: var(--ui-popover-background, var(--popover));
      }
      [data-ui-component="popover"][data-ui-part="popover-content"] {
        padding: calc(var(--spacing) * 4);
      }
      [data-ui-component="popover"][data-ui-part="popover-content"],
      [data-ui-component="popover"][data-ui-part="popover-header"] {
        font-size: var(--text-sm);
        line-height: var(--tw-leading, var(--text-sm--line-height));
      }
      [data-ui-component="popover"][data-ui-part="popover-title"] {
        --tw-font-weight: var(--font-weight-medium);
        font-weight: var(--font-weight-medium);
      }
      [data-ui-component="popover"][data-ui-part="popover-description"] {
        color: var(--muted-foreground);
      }
      [data-ui-component="popover"][data-ui-part="popover-content"] {
        color: var(--ui-popover-foreground, var(--popover-foreground));
      }
      [data-ui-component="popover"][data-ui-part="popover-content"] {
        --tw-shadow: 0 4px 6px -1px var(--tw-shadow-color, #0000001a),
          0 2px 4px -2px var(--tw-shadow-color, #0000001a);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="popover"][data-ui-part="popover-content"] {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(1px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="popover"][data-ui-part="popover-content"] {
        --tw-ring-color: var(--foreground);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="popover"][data-ui-part="popover-content"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--foreground) 10%,
            transparent
          );
        }
      }
      [data-ui-component="popover"][data-ui-part="popover-content"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      @media (forced-colors: active) {
        [data-ui-component="popover"][data-ui-part="popover-content"] {
          outline-offset: 2px;
          outline: 2px solid #0000;
        }
      }
      [data-ui-component="popover"][data-ui-part="popover-content"] {
        --tw-duration: 0.1s;
        transition-duration: 0.1s;
      }
      [data-ui-component="popover"][data-ui-part="popover-content"][data-side="bottom"] {
        --tw-enter-translate-y: calc(2 * var(--spacing) * -1);
      }
      [data-ui-component="popover"][data-ui-part="popover-content"][data-side="inline-end"] {
        --tw-enter-translate-x: calc(2 * var(--spacing) * -1);
      }
      [data-ui-component="popover"][data-ui-part="popover-content"][data-side="inline-start"],
      [data-ui-component="popover"][data-ui-part="popover-content"][data-side="left"] {
        --tw-enter-translate-x: calc(2 * var(--spacing));
      }
      [data-ui-component="popover"][data-ui-part="popover-content"][data-side="right"] {
        --tw-enter-translate-x: calc(2 * var(--spacing) * -1);
      }
      [data-ui-component="popover"][data-ui-part="popover-content"][data-side="top"] {
        --tw-enter-translate-y: calc(2 * var(--spacing));
      }
      [data-ui-component="popover"][data-ui-part="popover-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="popover"][data-ui-part="popover-content"]:where(
          [data-open]:not([data-open="false"])
        ) {
        animation: enter var(--tw-animation-duration, var(--tw-duration, 0.15s))
          var(--tw-ease, ease) var(--tw-animation-delay, 0s)
          var(--tw-animation-iteration-count, 1)
          var(--tw-animation-direction, normal)
          var(--tw-animation-fill-mode, none);
      }
      [data-ui-component="popover"][data-ui-part="popover-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="popover"][data-ui-part="popover-content"]:where(
          [data-open]:not([data-open="false"])
        ) {
        --tw-enter-opacity: 0;
      }
      [data-ui-component="popover"][data-ui-part="popover-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="popover"][data-ui-part="popover-content"]:where(
          [data-open]:not([data-open="false"])
        ) {
        --tw-enter-scale: 0.95;
      }
      [data-ui-component="popover"][data-ui-part="popover-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="popover"][data-ui-part="popover-content"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        animation: exit var(--tw-animation-duration, var(--tw-duration, 0.15s))
          var(--tw-ease, ease) var(--tw-animation-delay, 0s)
          var(--tw-animation-iteration-count, 1)
          var(--tw-animation-direction, normal)
          var(--tw-animation-fill-mode, none);
      }
      [data-ui-component="popover"][data-ui-part="popover-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="popover"][data-ui-part="popover-content"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        --tw-exit-opacity: 0;
      }
      [data-ui-component="popover"][data-ui-part="popover-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="popover"][data-ui-part="popover-content"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        --tw-exit-scale: 0.95;
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
    @property --tw-duration {
      syntax: "*";
      inherits: false;
    }
  }
</style>
