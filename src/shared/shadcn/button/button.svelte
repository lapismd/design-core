<script lang="ts" module>
  export const BUTTON_VARIANTS = [
    "default",
    "outline",
    "secondary",
    "ghost",
    "destructive",
    "link",
  ] as const;
  export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

  export const BUTTON_SIZES = [
    "default",
    "xs",
    "sm",
    "lg",
    "icon",
    "icon-xs",
    "icon-sm",
    "icon-lg",
  ] as const;
  export type ButtonSize = (typeof BUTTON_SIZES)[number];

  export type ButtonProps = import("svelte/elements").HTMLButtonAttributes & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    ref?: HTMLButtonElement | null;
  };

  /** @deprecated Prefer Button props; retained for API compatibility. */
  export function buttonVariants(_opts?: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    class?: string;
  }): string {
    return "";
  }
</script>

<script lang="ts">
  let {
    class: className,
    variant = "default",
    size = "default",
    ref = $bindable(null),
    type = "button",
    disabled,
    children,
    ...restProps
  }: ButtonProps = $props();
</script>

<button
  bind:this={ref}
  data-ui-component="button"
  data-slot="button"
  data-variant={variant}
  data-size={size}
  class={className}
  {type}
  {disabled}
  {...restProps}
>
  {@render children?.()}
</button>

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
      [data-ui-component="button"] {
        display: inline-flex;
      }
      [data-ui-component="button"][data-size="icon-xs"] {
        width: calc(var(--spacing) * 6);
        height: calc(var(--spacing) * 6);
      }
      [data-ui-component="button"][data-size="icon-sm"] {
        width: calc(var(--spacing) * 8);
        height: calc(var(--spacing) * 8);
      }
      [data-ui-component="button"][data-size="icon"] {
        width: calc(var(--spacing) * 9);
        height: calc(var(--spacing) * 9);
      }
      [data-ui-component="button"][data-size="icon-lg"] {
        width: calc(var(--spacing) * 10);
        height: calc(var(--spacing) * 10);
      }
      [data-ui-component="button"][data-size="xs"] {
        height: calc(var(--spacing) * 6);
      }
      [data-ui-component="button"][data-size="sm"] {
        height: calc(var(--spacing) * 8);
      }
      [data-ui-component="button"][data-size="default"] {
        height: calc(var(--spacing) * 9);
      }
      [data-ui-component="button"][data-size="lg"] {
        height: calc(var(--spacing) * 10);
      }
      [data-ui-component="button"] {
        flex-shrink: 0;
      }
      [data-ui-component="button"] {
        align-items: center;
      }
      [data-ui-component="button"] {
        justify-content: center;
      }
      [data-ui-component="button"][data-size="xs"],
      [data-ui-component="button"][data-size="sm"] {
        gap: var(--spacing);
      }
      [data-ui-component="button"][data-size="default"],
      [data-ui-component="button"][data-size="lg"] {
        gap: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="button"][data-size="xs"],
      [data-ui-component="button"][data-size="icon-xs"] {
        border-radius: min(var(--radius-md), 8px);
      }
      [data-ui-component="button"][data-size="sm"],
      [data-ui-component="button"][data-size="icon-sm"] {
        border-radius: min(var(--radius-md), 10px);
      }
      [data-ui-component="button"] {
        border-radius: calc(var(--radius) * 0.8);
      }
      [data-ui-component="button"] {
        border-style: var(--tw-border-style);
        border-width: 1px;
      }
      [data-ui-component="button"][data-variant="outline"] {
        border-color: var(--border);
      }
      [data-ui-component="button"] {
        border-color: #0000;
      }
      [data-ui-component="button"][data-variant="outline"] {
        background-color: var(--background);
      }
      [data-ui-component="button"][data-variant="destructive"] {
        background-color: var(--destructive);
      }
      [data-ui-component="button"][data-variant="default"] {
        background-color: var(--primary);
      }
      [data-ui-component="button"][data-variant="secondary"] {
        background-color: var(--secondary);
      }
      [data-ui-component="button"] {
        background-clip: padding-box;
      }
      [data-ui-component="button"][data-size="xs"] {
        padding-inline: calc(var(--spacing) * 2);
      }
      [data-ui-component="button"][data-size="default"],
      [data-ui-component="button"][data-size="sm"],
      [data-ui-component="button"][data-size="lg"] {
        padding-inline: calc(var(--spacing) * 2.5);
      }
      [data-ui-component="button"] {
        font-size: var(--text-sm);
        line-height: var(--tw-leading, var(--text-sm--line-height));
      }
      [data-ui-component="button"][data-size="xs"] {
        font-size: var(--text-xs);
        line-height: var(--tw-leading, var(--text-xs--line-height));
      }
      [data-ui-component="button"] {
        --tw-font-weight: var(--font-weight-medium);
        font-weight: var(--font-weight-medium);
      }
      [data-ui-component="button"] {
        white-space: nowrap;
      }
      [data-ui-component="button"][data-variant="link"] {
        color: var(--primary);
      }
      [data-ui-component="button"][data-variant="default"] {
        color: var(--primary-foreground);
      }
      [data-ui-component="button"][data-variant="secondary"] {
        color: var(--secondary-foreground);
      }
      [data-ui-component="button"][data-variant="destructive"] {
        color: var(--color-white);
      }
      [data-ui-component="button"][data-variant="link"] {
        text-underline-offset: 4px;
      }
      [data-ui-component="button"][data-variant="outline"] {
        --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, #0000000d);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="button"] {
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
      [data-ui-component="button"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      [data-ui-component="button"] {
        -webkit-user-select: none;
        user-select: none;
      }
      @media (hover: hover) {
        [data-ui-component="button"][data-variant="destructive"]:hover {
          background-color: var(--destructive);
        }
        @supports (color: color-mix(in lab, red, red)) {
          [data-ui-component="button"][data-variant="destructive"]:hover {
            background-color: color-mix(
              in oklab,
              var(--destructive) 90%,
              transparent
            );
          }
        }
        [data-ui-component="button"][data-variant="outline"]:hover,
        [data-ui-component="button"][data-variant="ghost"]:hover {
          background-color: var(--muted);
        }
        [data-ui-component="button"][data-variant="default"]:hover {
          background-color: var(--primary);
        }
        @supports (color: color-mix(in lab, red, red)) {
          [data-ui-component="button"][data-variant="default"]:hover {
            background-color: color-mix(
              in oklab,
              var(--primary) 80%,
              transparent
            );
          }
        }
        [data-ui-component="button"][data-variant="secondary"]:hover {
          background-color: var(--secondary);
        }
        @supports (color: color-mix(in lab, red, red)) {
          [data-ui-component="button"][data-variant="secondary"]:hover {
            background-color: color-mix(
              in oklab,
              var(--secondary) 80%,
              transparent
            );
          }
        }
        [data-ui-component="button"][data-variant="outline"]:hover,
        [data-ui-component="button"][data-variant="ghost"]:hover {
          color: var(--foreground);
        }
        [data-ui-component="button"][data-variant="link"]:hover {
          text-decoration-line: underline;
        }
      }
      [data-ui-component="button"][data-variant="destructive"]:focus-visible {
        border-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="button"][data-variant="destructive"]:focus-visible {
          border-color: color-mix(
            in oklab,
            var(--destructive) 40%,
            transparent
          );
        }
      }
      [data-ui-component="button"]:focus-visible {
        border-color: var(--ring);
      }
      [data-ui-component="button"]:focus-visible {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="button"][data-variant="destructive"]:focus-visible {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="button"][data-variant="destructive"]:focus-visible {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 20%,
            transparent
          );
        }
      }
      [data-ui-component="button"]:focus-visible {
        --tw-ring-color: var(--ring);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="button"]:focus-visible {
          --tw-ring-color: color-mix(in oklab, var(--ring) 50%, transparent);
        }
      }
      [data-ui-component="button"]:active:not([aria-haspopup]) {
        --tw-translate-y: 1px;
        translate: var(--tw-translate-x) var(--tw-translate-y);
      }
      [data-ui-component="button"]:disabled {
        pointer-events: none;
      }
      [data-ui-component="button"]:disabled {
        opacity: 0.5;
      }
      :where([data-slot="button-group"])
        [data-ui-component="button"][data-size="default"],
      :where([data-slot="button-group"])
        [data-ui-component="button"][data-size="xs"],
      :where([data-slot="button-group"])
        [data-ui-component="button"][data-size="sm"],
      :where([data-slot="button-group"])
        [data-ui-component="button"][data-size="icon-xs"],
      :where([data-slot="button-group"])
        [data-ui-component="button"][data-size="icon-sm"] {
        border-radius: calc(var(--radius) * 0.8);
      }
      [data-ui-component="button"][data-size="xs"]:has(
          [data-icon="inline-end"]
        ),
      [data-ui-component="button"][data-size="sm"]:has(
          [data-icon="inline-end"]
        ) {
        padding-right: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="button"][data-size="default"]:has(
          [data-icon="inline-end"]
        ),
      [data-ui-component="button"][data-size="lg"]:has(
          [data-icon="inline-end"]
        ) {
        padding-right: calc(var(--spacing) * 2);
      }
      [data-ui-component="button"][data-size="xs"]:has(
          [data-icon="inline-start"]
        ),
      [data-ui-component="button"][data-size="sm"]:has(
          [data-icon="inline-start"]
        ) {
        padding-left: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="button"][data-size="default"]:has(
          [data-icon="inline-start"]
        ),
      [data-ui-component="button"][data-size="lg"]:has(
          [data-icon="inline-start"]
        ) {
        padding-left: calc(var(--spacing) * 2);
      }
      [data-ui-component="button"][data-variant="outline"][aria-expanded="true"],
      [data-ui-component="button"][data-variant="ghost"][aria-expanded="true"] {
        background-color: var(--muted);
      }
      [data-ui-component="button"][data-variant="secondary"][aria-expanded="true"] {
        background-color: var(--secondary);
      }
      [data-ui-component="button"][data-variant="outline"][aria-expanded="true"],
      [data-ui-component="button"][data-variant="ghost"][aria-expanded="true"] {
        color: var(--foreground);
      }
      [data-ui-component="button"][data-variant="secondary"][aria-expanded="true"] {
        color: var(--secondary-foreground);
      }
      [data-ui-component="button"][aria-invalid="true"] {
        border-color: var(--destructive);
      }
      [data-ui-component="button"][aria-invalid="true"] {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="button"][aria-invalid="true"] {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="button"][aria-invalid="true"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 20%,
            transparent
          );
        }
      }
      [data-ui-component="button"][data-variant="outline"]:is(
          :global(.dark) *
        ) {
        border-color: var(--input);
      }
      [data-ui-component="button"][data-variant="outline"]:is(
          :global(.dark) *
        ) {
        background-color: var(--input);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="button"][data-variant="outline"]:is(
            :global(.dark) *
          ) {
          background-color: color-mix(in oklab, var(--input) 30%, transparent);
        }
      }
      @media (hover: hover) {
        [data-ui-component="button"][data-variant="outline"]:is(
            :global(.dark) *
          ):hover {
          background-color: var(--input);
        }
        @supports (color: color-mix(in lab, red, red)) {
          [data-ui-component="button"][data-variant="outline"]:is(
              :global(.dark) *
            ):hover {
            background-color: color-mix(
              in oklab,
              var(--input) 50%,
              transparent
            );
          }
        }
        [data-ui-component="button"][data-variant="ghost"]:is(
            :global(.dark) *
          ):hover {
          background-color: var(--muted);
        }
        @supports (color: color-mix(in lab, red, red)) {
          [data-ui-component="button"][data-variant="ghost"]:is(
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
      [data-ui-component="button"][data-variant="destructive"]:is(
          :global(.dark) *
        ):focus-visible {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="button"][data-variant="destructive"]:is(
            :global(.dark) *
          ):focus-visible {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 40%,
            transparent
          );
        }
      }
      [data-ui-component="button"]:is(:global(.dark) *)[aria-invalid="true"] {
        border-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="button"]:is(:global(.dark) *)[aria-invalid="true"] {
          border-color: color-mix(
            in oklab,
            var(--destructive) 50%,
            transparent
          );
        }
      }
      [data-ui-component="button"]:is(:global(.dark) *)[aria-invalid="true"] {
        --tw-ring-color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="button"]:is(:global(.dark) *)[aria-invalid="true"] {
          --tw-ring-color: color-mix(
            in oklab,
            var(--destructive) 40%,
            transparent
          );
        }
      }
      [data-ui-component="button"] svg {
        pointer-events: none;
      }
      [data-ui-component="button"] svg {
        flex-shrink: 0;
      }
      [data-ui-component="button"][data-size="xs"] svg:not([class*="size-"]),
      [data-ui-component="button"][data-size="icon-xs"]
        svg:not([class*="size-"]) {
        width: calc(var(--spacing) * 3);
        height: calc(var(--spacing) * 3);
      }
      [data-ui-component="button"] svg:not([class*="size-"]) {
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
