<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
  import AlertDialogPortal from "./alert-dialog-portal.svelte";
  import AlertDialogOverlay from "./alert-dialog-overlay.svelte";
  import {
    type WithoutChild,
    type WithoutChildrenOrChild,
  } from "../../../lib/utils.js";
  import type { ComponentProps } from "svelte";

  let {
    ref = $bindable(null),
    class: className,
    size = "default",
    portalProps,
    ...restProps
  }: WithoutChild<AlertDialogPrimitive.ContentProps> & {
    size?: "default" | "sm";
    portalProps?: WithoutChildrenOrChild<
      ComponentProps<typeof AlertDialogPortal>
    >;
  } = $props();
</script>

<AlertDialogPortal {...portalProps}>
  <AlertDialogOverlay />
  <AlertDialogPrimitive.Content
    bind:ref
    data-ui-component="alert-dialog"
    data-ui-part="alert-dialog-content"
    data-slot="alert-dialog-content"
    data-size={size}
    class={className}
    {...restProps}
  />
</AlertDialogPortal>

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
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"],
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-overlay"] {
        position: fixed;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-overlay"] {
        inset: 0;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"] {
        top: 50%;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"] {
        left: 50%;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"],
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-overlay"] {
        z-index: 50;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-media"] {
        margin-bottom: calc(var(--spacing) * 2);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-footer"] {
        display: flex;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"],
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-header"] {
        display: grid;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-media"] {
        display: inline-flex;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-media"] {
        width: calc(var(--spacing) * 16);
        height: calc(var(--spacing) * 16);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"] {
        width: 100%;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"] {
        --tw-translate-x: calc(calc(1 / 2 * 100%) * -1);
        translate: var(--tw-translate-x) var(--tw-translate-y);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"] {
        --tw-translate-y: calc(calc(1 / 2 * 100%) * -1);
        translate: var(--tw-translate-x) var(--tw-translate-y);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-header"] {
        grid-template-rows: auto 1fr;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-footer"] {
        flex-direction: column-reverse;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-header"] {
        place-items: center;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-media"] {
        align-items: center;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-media"] {
        justify-content: center;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-header"] {
        gap: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-footer"] {
        gap: calc(var(--spacing) * 2);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"] {
        gap: calc(var(--spacing) * 6);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-media"] {
        border-radius: calc(var(--radius) * 0.8);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"] {
        border-radius: calc(var(--radius) * 1.4);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-overlay"] {
        background-color: #0000001a;
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-overlay"] {
          background-color: color-mix(
            in oklab,
            var(--color-black) 10%,
            transparent
          );
        }
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-media"] {
        background-color: var(--muted);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"] {
        background-color: var(--popover);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"] {
        padding: calc(var(--spacing) * 6);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-header"] {
        text-align: center;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-title"] {
        font-size: var(--text-lg);
        line-height: var(--tw-leading, var(--text-lg--line-height));
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-description"] {
        font-size: var(--text-sm);
        line-height: var(--tw-leading, var(--text-sm--line-height));
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-title"] {
        --tw-font-weight: var(--font-weight-medium);
        font-weight: var(--font-weight-medium);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-description"] {
        text-wrap: balance;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-description"] {
        color: var(--muted-foreground);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"] {
        color: var(--popover-foreground);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"] {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(1px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"] {
        --tw-ring-color: var(--foreground);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--foreground) 10%,
            transparent
          );
        }
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"],
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-overlay"] {
        --tw-duration: 0.1s;
        transition-duration: 0.1s;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-footer"]:is(
          :where(
              [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]
            )[data-size="sm"]
            *
        ) {
        display: grid;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-footer"]:is(
          :where(
              [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]
            )[data-size="sm"]
            *
        ) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-header"]:has(
          [data-slot="alert-dialog-media"]
        ) {
        grid-template-rows: auto auto 1fr;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-header"]:has(
          [data-slot="alert-dialog-media"]
        ) {
        column-gap: calc(var(--spacing) * 6);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"][data-size="default"],
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"][data-size="sm"] {
        max-width: var(--container-xs);
      }
      @supports (
        (-webkit-backdrop-filter: var(--tw)) or (backdrop-filter: var(--tw))
      ) {
        [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-overlay"] {
          --tw-backdrop-blur: blur(var(--blur-xs));
          -webkit-backdrop-filter: var(--tw-backdrop-blur,)
            var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,)
            var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
            var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,)
            var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
          backdrop-filter: var(--tw-backdrop-blur,)
            var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,)
            var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
            var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,)
            var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
        }
      }
      @media (min-width: 40rem) {
        [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-footer"] {
          flex-direction: row;
        }
        [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-footer"] {
          justify-content: flex-end;
        }
        [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-media"]:is(
            :where(
                [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]
              )[data-size="default"]
              *
          ) {
          grid-row: span 2 / span 2;
        }
        [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-header"]:is(
            :where(
                [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]
              )[data-size="default"]
              *
          ) {
          place-items: start;
        }
        [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-header"]:is(
            :where(
                [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]
              )[data-size="default"]
              *
          ) {
          text-align: left;
        }
        [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-title"]:is(
            :where(
                [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]
              )[data-size="default"]
              *
          ):is(
            :where(
                [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]
              ):has([data-slot="alert-dialog-media"])
              *
          ) {
          grid-column-start: 2;
        }
        [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-header"]:is(
            :where(
                [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]
              )[data-size="default"]
              *
          ):has([data-slot="alert-dialog-media"]) {
          grid-template-rows: auto 1fr;
        }
        [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"][data-size="default"] {
          max-width: var(--container-lg);
        }
      }
      @media (min-width: 48rem) {
        [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-description"] {
          text-wrap: pretty;
        }
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-overlay"]:where(
          [data-state="open"]
        ),
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]:where(
          [data-open]:not([data-open="false"])
        ),
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-overlay"]:where(
          [data-open]:not([data-open="false"])
        ) {
        animation: enter var(--tw-animation-duration, var(--tw-duration, 0.15s))
          var(--tw-ease, ease) var(--tw-animation-delay, 0s)
          var(--tw-animation-iteration-count, 1)
          var(--tw-animation-direction, normal)
          var(--tw-animation-fill-mode, none);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-overlay"]:where(
          [data-state="open"]
        ),
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]:where(
          [data-open]:not([data-open="false"])
        ),
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-overlay"]:where(
          [data-open]:not([data-open="false"])
        ) {
        --tw-enter-opacity: 0;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]:where(
          [data-open]:not([data-open="false"])
        ) {
        --tw-enter-scale: 0.95;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-overlay"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]:where(
          [data-closed]:not([data-closed="false"])
        ),
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-overlay"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        animation: exit var(--tw-animation-duration, var(--tw-duration, 0.15s))
          var(--tw-ease, ease) var(--tw-animation-delay, 0s)
          var(--tw-animation-iteration-count, 1)
          var(--tw-animation-direction, normal)
          var(--tw-animation-fill-mode, none);
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-overlay"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]:where(
          [data-closed]:not([data-closed="false"])
        ),
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-overlay"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        --tw-exit-opacity: 0;
      }
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-content"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        --tw-exit-scale: 0.95;
      }
      :is(
          [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-description"]
            > *
        ):is(a) {
        text-decoration-line: underline;
      }
      :is(
          [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-description"]
            > *
        ):is(a) {
        text-underline-offset: 3px;
      }
      @media (hover: hover) {
        :is(
            [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-description"]
              > *
          ):is(a):hover {
          color: var(--foreground);
        }
      }
      :is(
          [data-ui-component="alert-dialog"][data-ui-part="alert-dialog-media"]
            > *
        ):is(svg:not([class*="size-"])) {
        width: calc(var(--spacing) * 8);
        height: calc(var(--spacing) * 8);
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
    @property --tw-backdrop-blur {
      syntax: "*";
      inherits: false;
    }
    @property --tw-backdrop-brightness {
      syntax: "*";
      inherits: false;
    }
    @property --tw-backdrop-contrast {
      syntax: "*";
      inherits: false;
    }
    @property --tw-backdrop-grayscale {
      syntax: "*";
      inherits: false;
    }
    @property --tw-backdrop-hue-rotate {
      syntax: "*";
      inherits: false;
    }
    @property --tw-backdrop-invert {
      syntax: "*";
      inherits: false;
    }
    @property --tw-backdrop-opacity {
      syntax: "*";
      inherits: false;
    }
    @property --tw-backdrop-saturate {
      syntax: "*";
      inherits: false;
    }
    @property --tw-backdrop-sepia {
      syntax: "*";
      inherits: false;
    }
  }
</style>
