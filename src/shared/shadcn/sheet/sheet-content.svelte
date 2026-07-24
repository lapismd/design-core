<script lang="ts" module>
  export type Side = "top" | "right" | "bottom" | "left";
</script>

<script lang="ts">
  import { Dialog as SheetPrimitive } from "bits-ui";
  import type { Snippet } from "svelte";
  import SheetPortal from "./sheet-portal.svelte";
  import SheetOverlay from "./sheet-overlay.svelte";
  import { Button } from "../button/index.js";
  import XIcon from "@lucide/svelte/icons/x";
  import { type WithoutChildrenOrChild } from "../../../lib/utils.js";
  import type { ComponentProps } from "svelte";

  let {
    ref = $bindable(null),
    class: className,
    side = "right",
    showCloseButton = true,
    portalProps,
    children,
    ...restProps
  }: WithoutChildrenOrChild<SheetPrimitive.ContentProps> & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof SheetPortal>>;
    side?: Side;
    showCloseButton?: boolean;
    children: Snippet;
  } = $props();
</script>

<SheetPortal {...portalProps}>
  <SheetOverlay />
  <SheetPrimitive.Content
    bind:ref
    data-ui-component="sheet"
    data-ui-part="sheet-content"
    data-slot="sheet-content"
    data-side={side}
    class={className}
    {...restProps}
  >
    {@render children?.()}
    {#if showCloseButton}
      <SheetPrimitive.Close data-slot="sheet-close">
        {#snippet child({ props })}
          <Button
            variant="ghost"
            data-ui-part="sheet-content-anon-0"
            data-slot="sheet-content-anon-0"
            size="icon-sm"
            {...props}
          >
            <XIcon />
            <span class="sr-only">Close</span>
          </Button>
        {/snippet}
      </SheetPrimitive.Close>
    {/if}
  </SheetPrimitive.Content>
</SheetPortal>

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
      [data-ui-part="sheet-content-anon-0"] {
        position: absolute;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"],
      [data-ui-component="sheet"][data-ui-part="sheet-overlay"] {
        position: fixed;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-overlay"] {
        inset: 0;
      }
      [data-ui-part="sheet-content-anon-0"] {
        top: calc(var(--spacing) * 4);
      }
      [data-ui-part="sheet-content-anon-0"] {
        right: calc(var(--spacing) * 4);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"],
      [data-ui-component="sheet"][data-ui-part="sheet-overlay"] {
        z-index: 50;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-footer"] {
        margin-top: auto;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"],
      [data-ui-component="sheet"][data-ui-part="sheet-footer"],
      [data-ui-component="sheet"][data-ui-part="sheet-header"] {
        display: flex;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"],
      [data-ui-component="sheet"][data-ui-part="sheet-footer"],
      [data-ui-component="sheet"][data-ui-part="sheet-header"] {
        flex-direction: column;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-header"] {
        gap: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-footer"] {
        gap: calc(var(--spacing) * 2);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"] {
        gap: calc(var(--spacing) * 4);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-overlay"] {
        background-color: #0000001a;
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="sheet"][data-ui-part="sheet-overlay"] {
          background-color: color-mix(
            in oklab,
            var(--color-black) 10%,
            transparent
          );
        }
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"] {
        background-color: var(--popover);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"] {
        background-clip: padding-box;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-footer"],
      [data-ui-component="sheet"][data-ui-part="sheet-header"] {
        padding: calc(var(--spacing) * 4);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"],
      [data-ui-component="sheet"][data-ui-part="sheet-description"] {
        font-size: var(--text-sm);
        line-height: var(--tw-leading, var(--text-sm--line-height));
      }
      [data-ui-component="sheet"][data-ui-part="sheet-title"] {
        --tw-font-weight: var(--font-weight-medium);
        font-weight: var(--font-weight-medium);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-title"] {
        color: var(--ui-sheet-foreground, var(--foreground));
      }
      [data-ui-component="sheet"][data-ui-part="sheet-description"] {
        color: var(--muted-foreground);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"] {
        color: var(--popover-foreground);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"] {
        --tw-shadow: 0 10px 15px -3px var(--tw-shadow-color, #0000001a),
          0 4px 6px -4px var(--tw-shadow-color, #0000001a);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"] {
        transition-property:
          color,
          background-color,
          border-color,
          outline-color,
          text-decoration-color,
          fill,
          stroke,
          --tw-gradient-from,
          --tw-gradient-via,
          --tw-gradient-to,
          opacity,
          box-shadow,
          transform,
          translate,
          scale,
          rotate,
          filter,
          -webkit-backdrop-filter,
          backdrop-filter,
          display,
          content-visibility,
          overlay,
          pointer-events;
        transition-timing-function: var(
          --tw-ease,
          var(--default-transition-timing-function)
        );
        transition-duration: var(
          --tw-duration,
          var(--default-transition-duration)
        );
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"] {
        --tw-duration: 0.2s;
        transition-duration: 0.2s;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"] {
        --tw-ease: var(--ease-in-out);
        transition-timing-function: var(--ease-in-out);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="bottom"] {
        inset-inline: 0;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="bottom"] {
        bottom: 0;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="bottom"] {
        height: auto;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="bottom"] {
        border-top-style: var(--tw-border-style);
        border-top-width: 1px;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="left"] {
        inset-block: 0;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="left"] {
        left: 0;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="left"] {
        height: 100%;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="left"] {
        width: 75%;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="left"] {
        border-right-style: var(--tw-border-style);
        border-right-width: 1px;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="right"] {
        inset-block: 0;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="right"] {
        right: 0;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="right"] {
        height: 100%;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="right"] {
        width: 75%;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="right"] {
        border-left-style: var(--tw-border-style);
        border-left-width: 1px;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="top"] {
        inset-inline: 0;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="top"] {
        top: 0;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="top"] {
        height: auto;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="top"] {
        border-bottom-style: var(--tw-border-style);
        border-bottom-width: 1px;
      }
      @supports (
        (-webkit-backdrop-filter: var(--tw)) or (backdrop-filter: var(--tw))
      ) {
        [data-ui-component="sheet"][data-ui-part="sheet-overlay"] {
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
        [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="left"],
        [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="right"] {
          max-width: var(--container-sm);
        }
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="sheet"][data-ui-part="sheet-content"]:where(
          [data-open]:not([data-open="false"])
        ) {
        animation: enter var(--tw-animation-duration, var(--tw-duration, 0.15s))
          var(--tw-ease, ease) var(--tw-animation-delay, 0s)
          var(--tw-animation-iteration-count, 1)
          var(--tw-animation-direction, normal)
          var(--tw-animation-fill-mode, none);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="sheet"][data-ui-part="sheet-content"]:where(
          [data-open]:not([data-open="false"])
        ) {
        --tw-enter-opacity: 0;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="bottom"]:where(
          [data-state="open"]
        ),
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="bottom"]:where(
          [data-open]:not([data-open="false"])
        ) {
        --tw-enter-translate-y: calc(0.1 * 100%);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="left"]:where(
          [data-state="open"]
        ),
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="left"]:where(
          [data-open]:not([data-open="false"])
        ) {
        --tw-enter-translate-x: calc(0.1 * -100%);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="right"]:where(
          [data-state="open"]
        ),
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="right"]:where(
          [data-open]:not([data-open="false"])
        ) {
        --tw-enter-translate-x: calc(0.1 * 100%);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="top"]:where(
          [data-state="open"]
        ),
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="top"]:where(
          [data-open]:not([data-open="false"])
        ) {
        --tw-enter-translate-y: calc(0.1 * -100%);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="sheet"][data-ui-part="sheet-content"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        animation: exit var(--tw-animation-duration, var(--tw-duration, 0.15s))
          var(--tw-ease, ease) var(--tw-animation-delay, 0s)
          var(--tw-animation-iteration-count, 1)
          var(--tw-animation-direction, normal)
          var(--tw-animation-fill-mode, none);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="sheet"][data-ui-part="sheet-content"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        --tw-exit-opacity: 0;
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="bottom"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="bottom"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        --tw-exit-translate-y: calc(0.1 * 100%);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="left"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="left"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        --tw-exit-translate-x: calc(0.1 * -100%);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="right"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="right"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        --tw-exit-translate-x: calc(0.1 * 100%);
      }
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="top"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="sheet"][data-ui-part="sheet-content"][data-side="top"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        --tw-exit-translate-y: calc(0.1 * -100%);
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
    @property --tw-ease {
      syntax: "*";
      inherits: false;
    }
    @property --tw-border-style {
      syntax: "*";
      inherits: false;
      initial-value: solid;
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
