<script lang="ts" module>
  export const BADGE_VARIANTS = [
    "default",
    "secondary",
    "destructive",
    "outline",
    "ghost",
    "link",
  ] as const;
  export type BadgeVariant = (typeof BADGE_VARIANTS)[number];

  /** @deprecated Prefer typed props; retained for API compatibility. */
  export function badgeVariants(_opts?: {
    variant?: BadgeVariant;
    class?: string;
  }): string {
    return "";
  }
</script>

<script lang="ts">
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import { type WithElementRef } from "../../../lib/utils.js";
  import { omitDataUiComponent } from "../../../lib/data-ui-host.js";

  let {
    ref = $bindable(null),
    href,
    class: className,
    variant = "default",
    children,
    ...restProps
  }: WithElementRef<HTMLAnchorAttributes> & {
    variant?: BadgeVariant;
  } = $props();
</script>

<svelte:element
  this={href ? "a" : "span"}
  bind:this={ref}
  {...omitDataUiComponent(restProps)}
  data-ui-component="badge"
  data-variant={variant}
  data-slot="badge"
  {href}
  class={className}
>
  {@render children?.()}
</svelte:element>

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
      [data-ui-component="badge"] {
        display: inline-flex;
      }
      [data-ui-component="badge"] {
        height: calc(var(--spacing) * 5);
      }
      [data-ui-component="badge"] {
        width: fit-content;
      }
      [data-ui-component="badge"] {
        flex-shrink: 0;
      }
      [data-ui-component="badge"] {
        align-items: center;
      }
      [data-ui-component="badge"] {
        justify-content: center;
      }
      [data-ui-component="badge"] {
        gap: var(--spacing);
      }
      [data-ui-component="badge"] {
        overflow: hidden;
      }
      [data-ui-component="badge"] {
        border-radius: calc(var(--radius) * 2.6);
      }
      [data-ui-component="badge"] {
        border-style: var(--tw-border-style);
        border-width: 1px;
      }
      [data-ui-component="badge"][data-variant="outline"] {
        border-color: var(--border);
      }
      [data-ui-component="badge"] {
        border-color: #0000;
      }
      [data-ui-component="badge"][data-variant="destructive"] {
        background-color: var(--destructive);
      }
      [data-ui-component="badge"][data-variant="default"] {
        background-color: var(--primary);
      }
      [data-ui-component="badge"][data-variant="secondary"] {
        background-color: var(--secondary);
      }
      [data-ui-component="badge"] {
        padding-inline: calc(var(--spacing) * 2);
      }
      [data-ui-component="badge"] {
        padding-block: calc(var(--spacing) * 0.5);
      }
      [data-ui-component="badge"] {
        font-size: var(--text-xs);
        line-height: var(--tw-leading, var(--text-xs--line-height));
      }
      [data-ui-component="badge"] {
        --tw-font-weight: var(--font-weight-medium);
        font-weight: var(--font-weight-medium);
      }
      [data-ui-component="badge"] {
        white-space: nowrap;
      }
      [data-ui-component="badge"][data-variant="outline"] {
        color: var(--foreground);
      }
      [data-ui-component="badge"][data-variant="link"] {
        color: var(--primary);
      }
      [data-ui-component="badge"][data-variant="default"] {
        color: var(--primary-foreground);
      }
      [data-ui-component="badge"][data-variant="secondary"] {
        color: var(--secondary-foreground);
      }
      [data-ui-component="badge"][data-variant="destructive"] {
        color: var(--color-white);
      }
      [data-ui-component="badge"][data-variant="link"] {
        text-underline-offset: 4px;
      }
      [data-ui-component="badge"] {
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
      [data-ui-component="badge"] {
        transition-property: color, background-color, border-color,
          outline-color, text-decoration-color, fill, stroke, --tw-gradient-from,
          --tw-gradient-via, --tw-gradient-to;
        transition-timing-function: var(
          --tw-ease,
          var(--default-transition-timing-function)
        );
        transition-duration: var(
          --tw-duration,
          var(--default-transition-duration)
        );
      }
      @media (hover: hover) {
        [data-ui-component="badge"][data-variant="ghost"]:hover {
          background-color: var(--muted);
        }
        [data-ui-component="badge"][data-variant="ghost"]:hover {
          color: var(--muted-foreground);
        }
        [data-ui-component="badge"][data-variant="link"]:hover {
          text-decoration-line: underline;
        }
      }
      [data-ui-component="badge"]:focus-visible {
        border-color: var(--ring);
      }
      [data-ui-component="badge"]:focus-visible {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="badge"][data-variant="destructive"]:focus-visible {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="badge"][data-variant="destructive"]:focus-visible {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 20%,
            transparent
          );
        }
      }
      [data-ui-component="badge"]:focus-visible {
        --tw-ring-color: var(--ring);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="badge"]:focus-visible {
          --tw-ring-color: color-mix(in oklab, var(--ring) 50%, transparent);
        }
      }
      [data-ui-component="badge"]:has([data-icon="inline-end"]) {
        padding-right: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="badge"]:has([data-icon="inline-start"]) {
        padding-left: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="badge"][aria-invalid="true"] {
        border-color: var(--destructive);
      }
      [data-ui-component="badge"][aria-invalid="true"] {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="badge"][aria-invalid="true"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 20%,
            transparent
          );
        }
      }
      @media (hover: hover) {
        [data-ui-component="badge"][data-variant="ghost"]:is(
            :global(.dark) *
          ):hover {
          background-color: var(--muted);
        }
        @supports (color: color-mix(in lab, red, red)) {
          [data-ui-component="badge"][data-variant="ghost"]:is(
              :global(.dark) *
            ):hover {
            background-color: color-mix(
              in oklab,
              var(--muted) 50%,
              transparent
            );
          }
        }
      }
      [data-ui-component="badge"][data-variant="destructive"]:is(
          :global(.dark) *
        ):focus-visible {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="badge"][data-variant="destructive"]:is(
            :global(.dark) *
          ):focus-visible {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 40%,
            transparent
          );
        }
      }
      [data-ui-component="badge"]:is(:global(.dark) *)[aria-invalid="true"] {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="badge"]:is(:global(.dark) *)[aria-invalid="true"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 40%,
            transparent
          );
        }
      }
      @media (hover: hover) {
        [data-ui-component="badge"][data-variant="destructive"]:is(a):hover {
          background-color: var(--destructive);
        }
        @supports (color: color-mix(in lab, red, red)) {
          [data-ui-component="badge"][data-variant="destructive"]:is(a):hover {
            background-color: color-mix(
              in oklab,
              var(--destructive) 90%,
              transparent
            );
          }
        }
        [data-ui-component="badge"][data-variant="outline"]:is(a):hover {
          background-color: var(--muted);
        }
        [data-ui-component="badge"][data-variant="default"]:is(a):hover {
          background-color: var(--primary);
        }
        @supports (color: color-mix(in lab, red, red)) {
          [data-ui-component="badge"][data-variant="default"]:is(a):hover {
            background-color: color-mix(
              in oklab,
              var(--primary) 80%,
              transparent
            );
          }
        }
        [data-ui-component="badge"][data-variant="secondary"]:is(a):hover {
          background-color: var(--secondary);
        }
        @supports (color: color-mix(in lab, red, red)) {
          [data-ui-component="badge"][data-variant="secondary"]:is(a):hover {
            background-color: color-mix(
              in oklab,
              var(--secondary) 80%,
              transparent
            );
          }
        }
        [data-ui-component="badge"][data-variant="outline"]:is(a):hover {
          color: var(--muted-foreground);
        }
      }
      [data-ui-component="badge"] > svg {
        pointer-events: none;
      }
      [data-ui-component="badge"] > svg {
        width: calc(var(--spacing) * 3) !important;
        height: calc(var(--spacing) * 3) !important;
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
