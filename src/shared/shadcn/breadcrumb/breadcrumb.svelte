<script lang="ts">
  import type { WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<nav
  bind:this={ref}
  {...restProps}
  data-ui-component="breadcrumb"
  data-ui-part="breadcrumb"
  data-slot="breadcrumb"
  aria-label="breadcrumb"
  class={className}
>
  {@render children?.()}
</nav>

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
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-ellipsis"],
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-list"] {
      display: flex;
    }
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-item"] {
      display: inline-flex;
    }
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-ellipsis"] {
      width: calc(var(--spacing) * 5);
      height: calc(var(--spacing) * 5);
    }
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-list"] {
      flex-wrap: wrap;
    }
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-ellipsis"],
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-item"],
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-list"] {
      align-items: center;
    }
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-ellipsis"] {
      justify-content: center;
    }
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-item"],
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-list"] {
      gap: calc(var(--spacing) * 1.5);
    }
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-list"] {
      font-size: var(--text-sm);
      line-height: var(--tw-leading, var(--text-sm--line-height));
    }
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-page"] {
      --tw-font-weight: var(--font-weight-normal);
      font-weight: var(--font-weight-normal);
    }
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-list"] {
      overflow-wrap: break-word;
    }
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-page"] {
      color: var(--foreground);
    }
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-list"] {
      color: var(--ui-breadcrumb-foreground, var(--muted-foreground));
    }
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-link"] {
      transition-property: color, background-color, border-color, outline-color,
        text-decoration-color, fill, stroke, --tw-gradient-from,
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
      [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-link"]:hover {
        color: var(--foreground);
      }
    }
    @media (min-width: 40rem) {
      [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-list"] {
        gap: calc(var(--spacing) * 2.5);
      }
    }
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-separator"]
      > svg {
      width: calc(var(--spacing) * 3.5);
      height: calc(var(--spacing) * 3.5);
    }
    [data-ui-component="breadcrumb"][data-ui-part="breadcrumb-ellipsis"] > svg {
      width: calc(var(--spacing) * 4);
      height: calc(var(--spacing) * 4);
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
  }
</style>
