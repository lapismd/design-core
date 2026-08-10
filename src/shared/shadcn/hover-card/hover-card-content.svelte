<script lang="ts">
  import { LinkPreview as HoverCardPrimitive } from "bits-ui";
  import { type WithoutChildrenOrChild } from "../../../lib/utils.js";
  import HoverCardPortal from "./hover-card-portal.svelte";
  import { getContext, type ComponentProps } from "svelte";
  import {
    disableOverlayPortalContextKey,
    hoverCardPortalContextKey,
    resolveOverlayPortalProps,
    type OverlayPortalContext,
  } from "../../../lib/overlay-portal-context.js";

  let {
    ref = $bindable(null),
    class: className,
    align = "center",
    sideOffset = 4,
    portalProps,
    ...restProps
  }: HoverCardPrimitive.ContentProps & {
    portalProps?: WithoutChildrenOrChild<
      ComponentProps<typeof HoverCardPortal>
    >;
  } = $props();

  const portalContext = getContext<OverlayPortalContext | undefined>(
    hoverCardPortalContextKey,
  );
  const disablePortals =
    getContext<boolean | undefined>(disableOverlayPortalContextKey) ?? false;
</script>

<HoverCardPortal
  {...resolveOverlayPortalProps(portalContext, portalProps, disablePortals)}
>
  <HoverCardPrimitive.Content
    bind:ref
    data-ui-component="hover-card"
    data-ui-part="hover-card-content"
    data-slot="hover-card-content"
    {align}
    {sideOffset}
    class={className}
    {...restProps}
  />
</HoverCardPortal>

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
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"] {
      z-index: var(
        --ui-hover-card-z-index,
        calc(var(--ui-workspace-overlay-z-index, 50) + 210)
      );
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"] {
      width: calc(var(--spacing) * 64);
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"] {
      transform-origin: var(--transform-origin);
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"] {
      border-radius: var(--radius);
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"] {
      background-color: var(--ui-hover-card-background, var(--popover));
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"] {
      padding: calc(var(--spacing) * 4);
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"] {
      font-size: var(--text-sm);
      line-height: var(--tw-leading, var(--text-sm--line-height));
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"] {
      color: var(--ui-hover-card-foreground, var(--popover-foreground));
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"] {
      --tw-shadow: 0 4px 6px -1px var(--tw-shadow-color, #0000001a),
        0 2px 4px -2px var(--tw-shadow-color, #0000001a);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
        var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"] {
      --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
        calc(1px + var(--tw-ring-offset-width))
        var(--tw-ring-color, currentcolor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
        var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"] {
      --tw-ring-color: var(--foreground);
    }
    @supports (color: color-mix(in lab, red, red)) {
      [data-ui-component="hover-card"][data-ui-part="hover-card-content"] {
        --tw-ring-color: color-mix(
          in oklab,
          var(--foreground) 10%,
          transparent
        );
      }
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"] {
      --tw-outline-style: none;
      outline-style: none;
    }
    @media (forced-colors: active) {
      [data-ui-component="hover-card"][data-ui-part="hover-card-content"] {
        outline-offset: 2px;
        outline: 2px solid #0000;
      }
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"] {
      --tw-duration: 0.1s;
      transition-duration: 0.1s;
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"][data-side="bottom"] {
      --tw-enter-translate-y: calc(2 * var(--spacing) * -1);
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"][data-side="left"] {
      --tw-enter-translate-x: calc(2 * var(--spacing));
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"][data-side="right"] {
      --tw-enter-translate-x: calc(2 * var(--spacing) * -1);
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"][data-side="top"] {
      --tw-enter-translate-y: calc(2 * var(--spacing));
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"]:where(
        [data-state="open"]
      ),
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"]:where(
        [data-open]:not([data-open="false"])
      ) {
      animation: enter var(--tw-animation-duration, var(--tw-duration, 0.15s))
        var(--tw-ease, ease) var(--tw-animation-delay, 0s)
        var(--tw-animation-iteration-count, 1)
        var(--tw-animation-direction, normal)
        var(--tw-animation-fill-mode, none);
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"]:where(
        [data-state="open"]
      ),
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"]:where(
        [data-open]:not([data-open="false"])
      ) {
      --tw-enter-opacity: 0;
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"]:where(
        [data-state="open"]
      ),
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"]:where(
        [data-open]:not([data-open="false"])
      ) {
      --tw-enter-scale: 0.95;
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"]:where(
        [data-state="closed"]
      ),
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"]:where(
        [data-closed]:not([data-closed="false"])
      ) {
      animation: exit var(--tw-animation-duration, var(--tw-duration, 0.15s))
        var(--tw-ease, ease) var(--tw-animation-delay, 0s)
        var(--tw-animation-iteration-count, 1)
        var(--tw-animation-direction, normal)
        var(--tw-animation-fill-mode, none);
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"]:where(
        [data-state="closed"]
      ),
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"]:where(
        [data-closed]:not([data-closed="false"])
      ) {
      --tw-exit-opacity: 0;
    }
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"]:where(
        [data-state="closed"]
      ),
    [data-ui-component="hover-card"][data-ui-part="hover-card-content"]:where(
        [data-closed]:not([data-closed="false"])
      ) {
      --tw-exit-scale: 0.95;
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
