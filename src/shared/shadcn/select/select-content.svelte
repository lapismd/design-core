<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui";
  import SelectPortal from "./select-portal.svelte";
  import SelectScrollUpButton from "./select-scroll-up-button.svelte";
  import SelectScrollDownButton from "./select-scroll-down-button.svelte";
  import { type WithoutChild } from "../../../lib/utils.js";
  import type { ComponentProps } from "svelte";
  import type { WithoutChildrenOrChild } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    sideOffset = 4,
    portalProps,
    children,
    preventScroll = true,
    ...restProps
  }: WithoutChild<SelectPrimitive.ContentProps> & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof SelectPortal>>;
  } = $props();
</script>

<SelectPortal {...portalProps}>
  <SelectPrimitive.Content
    bind:ref
    {sideOffset}
    {preventScroll}
    data-ui-component="select"
    data-ui-part="select-content"
    data-slot="select-content"
    class={className}
    {...restProps}
  >
    <SelectScrollUpButton />
    <SelectPrimitive.Viewport
      data-ui-component="select"
      data-ui-part="select-viewport"
      data-slot="select-viewport"
    >
      {@render children?.()}
    </SelectPrimitive.Viewport>
    <SelectScrollDownButton />
  </SelectPrimitive.Content>
</SelectPortal>

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
      [data-ui-component="select"][data-ui-part="select-separator"],
      [data-ui-component="select"][data-ui-part="select-chevron-down-icon"] {
        pointer-events: none;
      }
      [data-ui-component="select"][data-ui-part="select-item-anon-0"] {
        position: absolute;
      }
      [data-ui-component="select"][data-ui-part="select-content"],
      [data-ui-component="select"][data-ui-part="select-item"] {
        position: relative;
      }
      [data-ui-component="select"][data-ui-part="select-item-anon-0"] {
        inset-inline-end: calc(var(--spacing) * 2);
      }
      [data-ui-component="select"][data-ui-part="select-scroll-up-button"] {
        top: 0;
      }
      [data-ui-component="select"][data-ui-part="select-scroll-down-button"] {
        bottom: 0;
      }
      [data-ui-component="select"][data-ui-part="select-content"] {
        isolation: isolate;
      }
      [data-ui-component="select"][data-ui-part="select-scroll-down-button"],
      [data-ui-component="select"][data-ui-part="select-scroll-up-button"] {
        z-index: 10;
      }
      [data-ui-component="select"][data-ui-part="select-content"] {
        z-index: 50;
      }
      [data-ui-component="select"][data-ui-part="select-separator"] {
        margin-inline: calc(var(--spacing) * -1);
      }
      [data-ui-component="select"][data-ui-part="select-separator"] {
        margin-block: var(--spacing);
      }
      [data-ui-component="select"][data-ui-part="select-item"],
      [data-ui-component="select"][data-ui-part="select-item-anon-0"],
      [data-ui-component="select"][data-ui-part="select-item-anon-1"],
      [data-ui-component="select"][data-ui-part="select-scroll-down-button"],
      [data-ui-component="select"][data-ui-part="select-scroll-up-button"],
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        display: flex;
      }
      [data-ui-component="select"][data-ui-part="select-item-anon-0"] {
        width: calc(var(--spacing) * 3.5);
        height: calc(var(--spacing) * 3.5);
      }
      [data-ui-component="select"][data-ui-part="select-chevron-down-icon"] {
        width: calc(var(--spacing) * 4);
        height: calc(var(--spacing) * 4);
      }
      [data-ui-component="select"][data-ui-part="select-viewport"] {
        height: var(--bits-select-anchor-height);
      }
      [data-ui-component="select"][data-ui-part="select-separator"] {
        height: 1px;
      }
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        width: fit-content;
      }
      [data-ui-component="select"][data-ui-part="select-viewport"],
      [data-ui-component="select"][data-ui-part="select-item"],
      [data-ui-component="select"][data-ui-part="select-scroll-down-button"],
      [data-ui-component="select"][data-ui-part="select-scroll-up-button"] {
        width: 100%;
      }
      [data-ui-component="select"][data-ui-part="select-viewport"] {
        min-width: var(--bits-select-anchor-width);
      }
      [data-ui-component="select"][data-ui-part="select-content"] {
        min-width: calc(var(--spacing) * 36);
      }
      [data-ui-component="select"][data-ui-part="select-item-anon-1"] {
        flex: 1;
      }
      [data-ui-component="select"][data-ui-part="select-item-anon-1"] {
        flex-shrink: 0;
      }
      [data-ui-component="select"][data-ui-part="select-item"],
      [data-ui-component="select"][data-ui-part="select-scroll-down-button"],
      [data-ui-component="select"][data-ui-part="select-scroll-up-button"] {
        cursor: default;
      }
      [data-ui-component="select"][data-ui-part="select-viewport"],
      [data-ui-component="select"][data-ui-part="select-group"] {
        scroll-margin-block: var(--spacing);
      }
      [data-ui-component="select"][data-ui-part="select-item"],
      [data-ui-component="select"][data-ui-part="select-item-anon-0"],
      [data-ui-component="select"][data-ui-part="select-scroll-down-button"],
      [data-ui-component="select"][data-ui-part="select-scroll-up-button"],
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        align-items: center;
      }
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        justify-content: space-between;
      }
      [data-ui-component="select"][data-ui-part="select-item-anon-0"],
      [data-ui-component="select"][data-ui-part="select-scroll-down-button"],
      [data-ui-component="select"][data-ui-part="select-scroll-up-button"] {
        justify-content: center;
      }
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        gap: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="select"][data-ui-part="select-item"],
      [data-ui-component="select"][data-ui-part="select-item-anon-1"] {
        gap: calc(var(--spacing) * 2);
      }
      [data-ui-component="select"][data-ui-part="select-content"] {
        overflow-x: hidden;
      }
      [data-ui-component="select"][data-ui-part="select-content"] {
        overflow-y: auto;
      }
      [data-ui-component="select"][data-ui-part="select-content"],
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        border-radius: calc(var(--radius) * 0.8);
      }
      [data-ui-component="select"][data-ui-part="select-item"] {
        border-radius: calc(var(--radius) * 0.6);
      }
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        border-style: var(--tw-border-style);
        border-width: 1px;
      }
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        border-color: var(--input);
      }
      [data-ui-component="select"][data-ui-part="select-separator"] {
        background-color: var(--border);
      }
      [data-ui-component="select"][data-ui-part="select-content"],
      [data-ui-component="select"][data-ui-part="select-scroll-down-button"],
      [data-ui-component="select"][data-ui-part="select-scroll-up-button"] {
        background-color: var(--ui-select-background, var(--popover));
      }
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        background-color: #0000;
      }
      [data-ui-component="select"][data-ui-part="select-group"] {
        padding: var(--spacing);
      }
      [data-ui-component="select"][data-ui-part="select-group-heading"],
      [data-ui-component="select"][data-ui-part="select-label"] {
        padding-inline: calc(var(--spacing) * 2);
      }
      [data-ui-component="select"][data-ui-part="select-scroll-down-button"],
      [data-ui-component="select"][data-ui-part="select-scroll-up-button"] {
        padding-block: var(--spacing);
      }
      [data-ui-component="select"][data-ui-part="select-group-heading"],
      [data-ui-component="select"][data-ui-part="select-item"],
      [data-ui-component="select"][data-ui-part="select-label"] {
        padding-block: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        padding-block: calc(var(--spacing) * 2);
      }
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        padding-right: calc(var(--spacing) * 2);
      }
      [data-ui-component="select"][data-ui-part="select-item"] {
        padding-right: calc(var(--spacing) * 8);
      }
      [data-ui-component="select"][data-ui-part="select-item"] {
        padding-left: calc(var(--spacing) * 2);
      }
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        padding-left: calc(var(--spacing) * 2.5);
      }
      [data-ui-component="select"][data-ui-part="select-item"],
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        font-size: var(--text-sm);
        line-height: var(--tw-leading, var(--text-sm--line-height));
      }
      [data-ui-component="select"][data-ui-part="select-group-heading"],
      [data-ui-component="select"][data-ui-part="select-label"] {
        font-size: var(--text-xs);
        line-height: var(--tw-leading, var(--text-xs--line-height));
      }
      [data-ui-component="select"][data-ui-part="select-item-anon-1"],
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        white-space: nowrap;
      }
      [data-ui-component="select"][data-ui-part="select-group-heading"],
      [data-ui-component="select"][data-ui-part="select-label"],
      [data-ui-component="select"][data-ui-part="select-chevron-down-icon"] {
        color: var(--muted-foreground);
      }
      [data-ui-component="select"][data-ui-part="select-content"] {
        color: var(--ui-select-foreground, var(--popover-foreground));
      }
      [data-ui-component="select"][data-ui-part="select-content"] {
        --tw-shadow: 0 4px 6px -1px var(--tw-shadow-color, #0000001a),
          0 2px 4px -2px var(--tw-shadow-color, #0000001a);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, #0000000d);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="select"][data-ui-part="select-content"] {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(1px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="select"][data-ui-part="select-content"] {
        --tw-ring-color: var(--foreground);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="select"][data-ui-part="select-content"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--foreground) 10%,
            transparent
          );
        }
      }
      [data-ui-component="select"][data-ui-part="select-item"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      @media (forced-colors: active) {
        [data-ui-component="select"][data-ui-part="select-item"] {
          outline-offset: 2px;
          outline: 2px solid #0000;
        }
      }
      [data-ui-component="select"][data-ui-part="select-trigger"] {
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
      [data-ui-component="select"][data-ui-part="select-content"] {
        --tw-duration: 0.1s;
        transition-duration: 0.1s;
      }
      [data-ui-component="select"][data-ui-part="select-trigger"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      [data-ui-component="select"][data-ui-part="select-item"] {
        -webkit-user-select: none;
        user-select: none;
      }
      [data-ui-component="select"][data-ui-part="select-item"]:focus {
        background-color: var(--accent);
      }
      [data-ui-component="select"][data-ui-part="select-item"]:focus,
      :is(
          [data-ui-component="select"][data-ui-part="select-item"]:not(
              [data-variant="destructive"]
            ):focus
            *
        ) {
        color: var(--accent-foreground);
      }
      [data-ui-component="select"][data-ui-part="select-trigger"]:focus-visible {
        border-color: var(--ui-select-focus-ring-color, var(--ring));
      }
      [data-ui-component="select"][data-ui-part="select-trigger"]:focus-visible {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="select"][data-ui-part="select-trigger"]:focus-visible {
        --tw-ring-color: var(--ui-select-focus-ring-color, var(--ring));
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="select"][data-ui-part="select-trigger"]:focus-visible {
          --tw-ring-color: color-mix(
            in oklab,
            var(--ui-select-focus-ring-color, var(--ring)) 50%,
            transparent
          );
        }
      }
      [data-ui-component="select"][data-ui-part="select-trigger"]:disabled {
        cursor: not-allowed;
      }
      [data-ui-component="select"][data-ui-part="select-trigger"]:disabled {
        opacity: 0.5;
      }
      [data-ui-component="select"][data-ui-part="select-trigger"][aria-invalid="true"] {
        border-color: var(--destructive);
      }
      [data-ui-component="select"][data-ui-part="select-trigger"][aria-invalid="true"] {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="select"][data-ui-part="select-trigger"][aria-invalid="true"] {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="select"][data-ui-part="select-trigger"][aria-invalid="true"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 20%,
            transparent
          );
        }
      }
      [data-ui-component="select"][data-ui-part="select-item"][data-highlighted] {
        background-color: var(--accent);
      }
      [data-ui-component="select"][data-ui-part="select-item"][data-highlighted] {
        color: var(--accent-foreground);
      }
      [data-ui-component="select"][data-ui-part="select-trigger"][data-placeholder] {
        color: var(--muted-foreground);
      }
      [data-ui-component="select"][data-ui-part="select-item"][data-disabled] {
        pointer-events: none;
      }
      [data-ui-component="select"][data-ui-part="select-item"][data-disabled] {
        opacity: 0.5;
      }
      [data-ui-component="select"][data-ui-part="select-content"][data-side="bottom"] {
        --tw-enter-translate-y: calc(2 * var(--spacing) * -1);
      }
      [data-ui-component="select"][data-ui-part="select-content"][data-side="inline-end"] {
        --tw-enter-translate-x: calc(2 * var(--spacing) * -1);
      }
      [data-ui-component="select"][data-ui-part="select-content"][data-side="inline-start"],
      [data-ui-component="select"][data-ui-part="select-content"][data-side="left"] {
        --tw-enter-translate-x: calc(2 * var(--spacing));
      }
      [data-ui-component="select"][data-ui-part="select-content"][data-side="right"] {
        --tw-enter-translate-x: calc(2 * var(--spacing) * -1);
      }
      [data-ui-component="select"][data-ui-part="select-content"][data-side="top"] {
        --tw-enter-translate-y: calc(2 * var(--spacing));
      }
      [data-ui-component="select"][data-ui-part="select-trigger"][data-size="default"] {
        height: calc(var(--spacing) * 9);
      }
      [data-ui-component="select"][data-ui-part="select-trigger"][data-size="sm"] {
        height: calc(var(--spacing) * 8);
      }
      :is(
          [data-ui-component="select"][data-ui-part="select-trigger"] > *
        )[data-slot="select-value"] {
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
        display: -webkit-box;
        overflow: hidden;
      }
      :is(
          [data-ui-component="select"][data-ui-part="select-trigger"] > *
        )[data-slot="select-value"] {
        display: flex;
      }
      :is(
          [data-ui-component="select"][data-ui-part="select-trigger"] > *
        )[data-slot="select-value"] {
        align-items: center;
      }
      :is(
          [data-ui-component="select"][data-ui-part="select-trigger"] > *
        )[data-slot="select-value"] {
        gap: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="select"][data-ui-part="select-trigger"]:is(
          :global(.dark) *
        ) {
        background-color: var(--input);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="select"][data-ui-part="select-trigger"]:is(
            :global(.dark) *
          ) {
          background-color: color-mix(in oklab, var(--input) 30%, transparent);
        }
      }
      @media (hover: hover) {
        [data-ui-component="select"][data-ui-part="select-trigger"]:is(
            :global(.dark) *
          ):hover {
          background-color: var(--input);
        }
        @supports (color: color-mix(in lab, red, red)) {
          [data-ui-component="select"][data-ui-part="select-trigger"]:is(
              :global(.dark) *
            ):hover {
            background-color: color-mix(
              in oklab,
              var(--input) 50%,
              transparent
            );
          }
        }
      }
      [data-ui-component="select"][data-ui-part="select-trigger"]:is(
          :global(.dark) *
        )[aria-invalid="true"] {
        border-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="select"][data-ui-part="select-trigger"]:is(
            :global(.dark) *
          )[aria-invalid="true"] {
          border-color: color-mix(
            in oklab,
            var(--destructive) 50%,
            transparent
          );
        }
      }
      [data-ui-component="select"][data-ui-part="select-trigger"]:is(
          :global(.dark) *
        )[aria-invalid="true"] {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="select"][data-ui-part="select-trigger"]:is(
            :global(.dark) *
          )[aria-invalid="true"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 40%,
            transparent
          );
        }
      }
      [data-ui-component="select"][data-ui-part="select-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="select"][data-ui-part="select-content"]:where(
          [data-open]:not([data-open="false"])
        ) {
        animation: enter var(--tw-animation-duration, var(--tw-duration, 0.15s))
          var(--tw-ease, ease) var(--tw-animation-delay, 0s)
          var(--tw-animation-iteration-count, 1)
          var(--tw-animation-direction, normal)
          var(--tw-animation-fill-mode, none);
      }
      [data-ui-component="select"][data-ui-part="select-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="select"][data-ui-part="select-content"]:where(
          [data-open]:not([data-open="false"])
        ) {
        --tw-enter-opacity: 0;
      }
      [data-ui-component="select"][data-ui-part="select-content"]:where(
          [data-state="open"]
        ),
      [data-ui-component="select"][data-ui-part="select-content"]:where(
          [data-open]:not([data-open="false"])
        ) {
        --tw-enter-scale: 0.95;
      }
      [data-ui-component="select"][data-ui-part="select-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="select"][data-ui-part="select-content"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        animation: exit var(--tw-animation-duration, var(--tw-duration, 0.15s))
          var(--tw-ease, ease) var(--tw-animation-delay, 0s)
          var(--tw-animation-iteration-count, 1)
          var(--tw-animation-direction, normal)
          var(--tw-animation-fill-mode, none);
      }
      [data-ui-component="select"][data-ui-part="select-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="select"][data-ui-part="select-content"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        --tw-exit-opacity: 0;
      }
      [data-ui-component="select"][data-ui-part="select-content"]:where(
          [data-state="closed"]
        ),
      [data-ui-component="select"][data-ui-part="select-content"]:where(
          [data-closed]:not([data-closed="false"])
        ) {
        --tw-exit-scale: 0.95;
      }
      [data-ui-component="select"][data-ui-part="select-item"] svg,
      [data-ui-component="select"][data-ui-part="select-trigger"] svg {
        pointer-events: none;
      }
      [data-ui-component="select"][data-ui-part="select-item"] svg,
      [data-ui-component="select"][data-ui-part="select-trigger"] svg {
        flex-shrink: 0;
      }
      [data-ui-component="select"][data-ui-part="select-item"]
        svg:not([class*="size-"]),
      [data-ui-component="select"][data-ui-part="select-scroll-down-button"]
        svg:not([class*="size-"]),
      [data-ui-component="select"][data-ui-part="select-scroll-up-button"]
        svg:not([class*="size-"]),
      [data-ui-component="select"][data-ui-part="select-trigger"]
        svg:not([class*="size-"]) {
        width: calc(var(--spacing) * 4);
        height: calc(var(--spacing) * 4);
      }
      :is([data-ui-component="select"][data-ui-part="select-item"] > *):is(
          span
        ):last-child {
        display: flex;
      }
      :is([data-ui-component="select"][data-ui-part="select-item"] > *):is(
          span
        ):last-child {
        align-items: center;
      }
      :is([data-ui-component="select"][data-ui-part="select-item"] > *):is(
          span
        ):last-child {
        gap: calc(var(--spacing) * 2);
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
    @property --tw-duration {
      syntax: "*";
      inherits: false;
    }
  }
</style>
