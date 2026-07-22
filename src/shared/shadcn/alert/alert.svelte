<script lang="ts" module>
  export const ALERT_VARIANTS = ["default", "destructive"] as const;
  export type AlertVariant = (typeof ALERT_VARIANTS)[number];

  /** @deprecated Prefer typed props; retained for API compatibility. */
  export function alertVariants(_opts?: {
    variant?: AlertVariant;
    class?: string;
  }): string {
    return "";
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { type WithElementRef } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    variant = "default",
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    variant?: AlertVariant;
  } = $props();
</script>

<div
  bind:this={ref}
  data-ui-component="alert"
  data-ui-part="alert"
  data-variant={variant}
  data-slot="alert"
  role="alert"
  class={className}
  {...restProps}
>
  {@render children?.()}
</div>

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
      [data-ui-component="alert"][data-ui-part="alert-action"] {
        position: absolute;
      }
      [data-ui-component="alert"][data-ui-part="alert"] {
        position: relative;
      }
      [data-ui-component="alert"][data-ui-part="alert-action"] {
        top: calc(var(--spacing) * 2.5);
      }
      [data-ui-component="alert"][data-ui-part="alert-action"] {
        right: calc(var(--spacing) * 3);
      }
      [data-ui-component="alert"][data-ui-part="alert"] {
        display: grid;
      }
      [data-ui-component="alert"][data-ui-part="alert"] {
        width: 100%;
      }
      [data-ui-component="alert"][data-ui-part="alert"] {
        gap: calc(var(--spacing) * 0.5);
      }
      [data-ui-component="alert"][data-ui-part="alert"] {
        border-radius: var(--radius);
      }
      [data-ui-component="alert"][data-ui-part="alert"] {
        border-style: var(--tw-border-style);
        border-width: 1px;
      }
      [data-ui-component="alert"][data-ui-part="alert"][data-variant="default"],
      [data-ui-component="alert"][data-ui-part="alert"][data-variant="destructive"] {
        background-color: var(--card);
      }
      [data-ui-component="alert"][data-ui-part="alert"] {
        padding-inline: calc(var(--spacing) * 4);
      }
      [data-ui-component="alert"][data-ui-part="alert"] {
        padding-block: calc(var(--spacing) * 3);
      }
      [data-ui-component="alert"][data-ui-part="alert"] {
        text-align: left;
      }
      [data-ui-component="alert"][data-ui-part="alert-description"],
      [data-ui-component="alert"][data-ui-part="alert"] {
        font-size: var(--text-sm);
        line-height: var(--tw-leading, var(--text-sm--line-height));
      }
      [data-ui-component="alert"][data-ui-part="alert-title"] {
        --tw-font-weight: var(--font-weight-medium);
        font-weight: var(--font-weight-medium);
      }
      [data-ui-component="alert"][data-ui-part="alert-description"] {
        text-wrap: balance;
      }
      [data-ui-component="alert"][data-ui-part="alert"][data-variant="default"] {
        color: var(--card-foreground);
      }
      [data-ui-component="alert"][data-ui-part="alert"][data-variant="destructive"] {
        color: var(--destructive);
      }
      [data-ui-component="alert"][data-ui-part="alert-description"] {
        color: var(--muted-foreground);
      }
      [data-ui-component="alert"][data-ui-part="alert-title"]:is(
          :where(.group\/alert):has(> svg) *
        ),
      .group-has-\[\>svg\]\/alert\:col-start-2:is(
          :where([data-ui-component="alert"][data-ui-part="alert"]):has(> svg) *
        ) {
        grid-column-start: 2;
      }
      [data-ui-component="alert"][data-ui-part="alert"]:has(
          [data-slot="alert-action"]
        ) {
        position: relative;
      }
      [data-ui-component="alert"][data-ui-part="alert"]:has(
          [data-slot="alert-action"]
        ) {
        padding-right: calc(var(--spacing) * 18);
      }
      [data-ui-component="alert"][data-ui-part="alert"]:has(> svg) {
        grid-template-columns: auto 1fr;
      }
      [data-ui-component="alert"][data-ui-part="alert"]:has(> svg) {
        column-gap: calc(var(--spacing) * 2.5);
      }
      :is(
          [data-ui-component="alert"][data-ui-part="alert"][data-variant="destructive"]
            > *
        )[data-slot="alert-description"] {
        color: var(--destructive);
      }
      @supports (color: color-mix(in lab, red, red)) {
        :is(
            [data-ui-component="alert"][data-ui-part="alert"][data-variant="destructive"]
              > *
          )[data-slot="alert-description"] {
          color: color-mix(in oklab, var(--destructive) 90%, transparent);
        }
      }
      @media (min-width: 48rem) {
        [data-ui-component="alert"][data-ui-part="alert-description"] {
          text-wrap: pretty;
        }
      }
      [data-ui-component="alert"][data-ui-part="alert-description"] a,
      [data-ui-component="alert"][data-ui-part="alert-title"] a {
        text-decoration-line: underline;
      }
      [data-ui-component="alert"][data-ui-part="alert-description"] a,
      [data-ui-component="alert"][data-ui-part="alert-title"] a {
        text-underline-offset: 3px;
      }
      @media (hover: hover) {
        [data-ui-component="alert"][data-ui-part="alert-description"] a:hover,
        [data-ui-component="alert"][data-ui-part="alert-title"] a:hover {
          color: var(--foreground);
        }
      }
      [data-ui-component="alert"][data-ui-part="alert-description"]
        p:not(:last-child) {
        margin-bottom: calc(var(--spacing) * 4);
      }
      :is([data-ui-component="alert"][data-ui-part="alert"] > *):is(svg) {
        grid-row: span 2 / span 2;
      }
      :is([data-ui-component="alert"][data-ui-part="alert"] > *):is(svg) {
        --tw-translate-y: calc(var(--spacing) * 0.5);
        translate: var(--tw-translate-x) var(--tw-translate-y);
      }
      :is([data-ui-component="alert"][data-ui-part="alert"] > *):is(svg),
      :is(
          [data-ui-component="alert"][data-ui-part="alert"][data-variant="destructive"]
            > *
        ):is(svg) {
        color: currentColor;
      }
      :is([data-ui-component="alert"][data-ui-part="alert"] > *):is(
          svg:not([class*="size-"])
        ) {
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
