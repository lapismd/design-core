<script lang="ts">
  import { Pagination as PaginationPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    class: className,
    count = 0,
    perPage = 10,
    page = $bindable(1),
    siblingCount = 1,
    ...restProps
  }: PaginationPrimitive.RootProps = $props();
</script>

<PaginationPrimitive.Root
  bind:ref
  bind:page
  role="navigation"
  aria-label="pagination"
  data-ui-component="pagination"
  data-ui-part="pagination"
  data-slot="pagination"
  {count}
  {perPage}
  {siblingCount}
  class={className}
  {...restProps}
/>

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
    [data-ui-component="pagination"][data-ui-part="pagination"] {
      margin-inline: auto;
      width: 100%;
      display: flex;
      justify-content: center;
    }
    [data-ui-component="pagination"][data-ui-part="pagination-content"],
    [data-ui-component="pagination"][data-ui-part="pagination-ellipsis"] {
      display: flex;
      align-items: center;
    }
    [data-ui-component="pagination"][data-ui-part="pagination-ellipsis"] {
      justify-content: center;
      width: calc(var(--spacing) * 9);
      height: calc(var(--spacing) * 9);
    }
    [data-ui-component="pagination"][data-ui-part="pagination-content"] {
      gap: var(--spacing);
    }
    [data-ui-component="pagination"][data-ui-part="pagination-next-button"],
    [data-ui-component="pagination"][data-ui-part="pagination-prev-button"] {
      width: calc(var(--spacing) * 4);
      height: calc(var(--spacing) * 4);
    }

    /*
     * Upstream Link / Previous / Next use buttonVariants (ghost/outline + size).
     * buttonVariants is a no-op here, so mirror Button look via data-variant/size.
     */
    [data-ui-component="pagination"][data-ui-part="pagination-link"],
    [data-ui-component="pagination"][data-ui-part="pagination-previous"],
    [data-ui-component="pagination"][data-ui-part="pagination-next"],
    [data-ui-component="pagination"][data-ui-part="pagination-prev-button-anon-0"],
    [data-ui-component="pagination"][data-ui-part="pagination-next-button-anon-0"] {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      border-style: solid;
      border-width: 1px;
      border-color: transparent;
      background-color: var(--ui-pagination-background, transparent);
      background-clip: padding-box;
      color: var(--ui-pagination-foreground, var(--foreground));
      border-radius: var(
        --ui-pagination-radius,
        var(--radius-md, calc(var(--radius) * 0.8))
      );
      font-size: var(--text-sm);
      line-height: var(--tw-leading, var(--text-sm--line-height));
      font-weight: var(--font-weight-medium);
      white-space: nowrap;
      transition-property: color, background-color, border-color, box-shadow,
        translate;
      transition-timing-function: var(
        --tw-ease,
        var(--default-transition-timing-function)
      );
      transition-duration: var(
        --tw-duration,
        var(--default-transition-duration)
      );
      outline-style: none;
      user-select: none;
      cursor: pointer;
    }
    [data-ui-component="pagination"][data-ui-part="pagination-link"][data-size="icon"],
    [data-ui-component="pagination"][data-ui-part="pagination-previous"][data-size="icon"],
    [data-ui-component="pagination"][data-ui-part="pagination-next"][data-size="icon"],
    [data-ui-component="pagination"][data-ui-part="pagination-prev-button-anon-0"][data-size="icon"],
    [data-ui-component="pagination"][data-ui-part="pagination-next-button-anon-0"][data-size="icon"] {
      width: calc(var(--spacing) * 9);
      height: calc(var(--spacing) * 9);
    }
    [data-ui-component="pagination"][data-ui-part="pagination-link"][data-size="default"],
    [data-ui-component="pagination"][data-ui-part="pagination-previous"][data-size="default"],
    [data-ui-component="pagination"][data-ui-part="pagination-next"][data-size="default"],
    [data-ui-component="pagination"][data-ui-part="pagination-prev-button-anon-0"][data-size="default"],
    [data-ui-component="pagination"][data-ui-part="pagination-next-button-anon-0"][data-size="default"] {
      height: calc(var(--spacing) * 9);
      gap: calc(var(--spacing) * 1.5);
      padding-inline: calc(var(--spacing) * 2.5);
    }
    [data-ui-component="pagination"][data-ui-part="pagination-link"][data-variant="outline"],
    [data-ui-component="pagination"][data-ui-part="pagination-previous"][data-variant="outline"],
    [data-ui-component="pagination"][data-ui-part="pagination-next"][data-variant="outline"],
    [data-ui-component="pagination"][data-ui-part="pagination-prev-button-anon-0"][data-variant="outline"],
    [data-ui-component="pagination"][data-ui-part="pagination-next-button-anon-0"][data-variant="outline"] {
      border-color: var(--ui-pagination-border-color, var(--border));
      background-color: var(--background);
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }
    @media (hover: hover) {
      [data-ui-component="pagination"][data-ui-part="pagination-link"][data-variant="ghost"]:hover,
      [data-ui-component="pagination"][data-ui-part="pagination-previous"][data-variant="ghost"]:hover,
      [data-ui-component="pagination"][data-ui-part="pagination-next"][data-variant="ghost"]:hover,
      [data-ui-component="pagination"][data-ui-part="pagination-prev-button-anon-0"][data-variant="ghost"]:hover,
      [data-ui-component="pagination"][data-ui-part="pagination-next-button-anon-0"][data-variant="ghost"]:hover,
      [data-ui-component="pagination"][data-ui-part="pagination-link"][data-variant="outline"]:hover,
      [data-ui-component="pagination"][data-ui-part="pagination-previous"][data-variant="outline"]:hover,
      [data-ui-component="pagination"][data-ui-part="pagination-next"][data-variant="outline"]:hover,
      [data-ui-component="pagination"][data-ui-part="pagination-prev-button-anon-0"][data-variant="outline"]:hover,
      [data-ui-component="pagination"][data-ui-part="pagination-next-button-anon-0"][data-variant="outline"]:hover {
        background-color: var(--muted);
        color: var(--foreground);
      }
    }
    [data-ui-component="pagination"][data-ui-part="pagination-link"]:focus-visible,
    [data-ui-component="pagination"][data-ui-part="pagination-previous"]:focus-visible,
    [data-ui-component="pagination"][data-ui-part="pagination-next"]:focus-visible,
    [data-ui-component="pagination"][data-ui-part="pagination-prev-button-anon-0"]:focus-visible,
    [data-ui-component="pagination"][data-ui-part="pagination-next-button-anon-0"]:focus-visible {
      border-color: var(--ui-pagination-focus-ring-color, var(--ring));
      box-shadow: 0 0 0 3px
        color-mix(
          in oklab,
          var(--ui-pagination-focus-ring-color, var(--ring)) 50%,
          transparent
        );
    }
    [data-ui-component="pagination"][data-ui-part="pagination-link"]:disabled,
    [data-ui-component="pagination"][data-ui-part="pagination-previous"]:disabled,
    [data-ui-component="pagination"][data-ui-part="pagination-next"]:disabled,
    [data-ui-component="pagination"][data-ui-part="pagination-prev-button-anon-0"]:disabled,
    [data-ui-component="pagination"][data-ui-part="pagination-next-button-anon-0"]:disabled,
    [data-ui-component="pagination"][data-ui-part="pagination-link"][data-disabled],
    [data-ui-component="pagination"][data-ui-part="pagination-previous"][data-disabled],
    [data-ui-component="pagination"][data-ui-part="pagination-next"][data-disabled],
    [data-ui-component="pagination"][data-ui-part="pagination-prev-button-anon-0"][data-disabled],
    [data-ui-component="pagination"][data-ui-part="pagination-next-button-anon-0"][data-disabled] {
      pointer-events: none;
      opacity: 0.5;
    }
    [data-ui-component="pagination"][data-ui-part="pagination-link"] svg,
    [data-ui-component="pagination"][data-ui-part="pagination-previous"] svg,
    [data-ui-component="pagination"][data-ui-part="pagination-next"] svg,
    [data-ui-component="pagination"][data-ui-part="pagination-prev-button-anon-0"]
      svg,
    [data-ui-component="pagination"][data-ui-part="pagination-next-button-anon-0"]
      svg {
      pointer-events: none;
      flex-shrink: 0;
      width: calc(var(--spacing) * 4);
      height: calc(var(--spacing) * 4);
    }
    [data-ui-component="pagination"][data-ui-part="pagination-next-button-anon-0"],
    [data-ui-component="pagination"][data-ui-part="pagination-next"] {
      padding-right: calc(var(--spacing) * 2) !important;
    }
    [data-ui-component="pagination"][data-ui-part="pagination-prev-button-anon-0"],
    [data-ui-component="pagination"][data-ui-part="pagination-previous"] {
      padding-left: calc(var(--spacing) * 2) !important;
    }
    [data-ui-component="pagination"][data-ui-part="pagination-ellipsis"]
      svg:not([class*="size-"]) {
      width: calc(var(--spacing) * 4);
      height: calc(var(--spacing) * 4);
    }
    .cn-pagination-next-text,
    .cn-pagination-previous-text {
      display: none;
    }
    @media (min-width: 640px) {
      .cn-pagination-next-text,
      .cn-pagination-previous-text {
        display: block;
      }
    }
    @property --tw-outline-style {
      syntax: "*";
      inherits: false;
      initial-value: solid;
    }
  }
</style>
