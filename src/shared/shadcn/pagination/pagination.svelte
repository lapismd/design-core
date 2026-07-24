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
    }
    [data-ui-component="pagination"][data-ui-part="pagination-content"],
    [data-ui-component="pagination"][data-ui-part="pagination-ellipsis"],
    [data-ui-component="pagination"][data-ui-part="pagination"] {
      display: flex;
    }
    [data-ui-component="pagination"][data-ui-part="pagination-next-button"],
    [data-ui-component="pagination"][data-ui-part="pagination-prev-button"] {
      width: calc(var(--spacing) * 4);
      height: calc(var(--spacing) * 4);
    }
    [data-ui-component="pagination"][data-ui-part="pagination-ellipsis"] {
      width: calc(var(--spacing) * 9);
      height: calc(var(--spacing) * 9);
    }
    [data-ui-component="pagination"][data-ui-part="pagination"] {
      width: 100%;
    }
    [data-ui-component="pagination"][data-ui-part="pagination-content"],
    [data-ui-component="pagination"][data-ui-part="pagination-ellipsis"] {
      align-items: center;
    }
    [data-ui-component="pagination"][data-ui-part="pagination-ellipsis"],
    [data-ui-component="pagination"][data-ui-part="pagination"] {
      justify-content: center;
    }
    [data-ui-component="pagination"][data-ui-part="pagination-content"] {
      gap: var(--spacing);
    }
    [data-ui-component="pagination"][data-ui-part="pagination-next-button-anon-0"],
    [data-ui-component="pagination"][data-ui-part="pagination-next"] {
      padding-right: calc(var(--spacing) * 2) !important;
    }
    [data-ui-component="pagination"][data-ui-part="pagination-prev-button-anon-0"],
    [data-ui-component="pagination"][data-ui-part="pagination-previous"] {
      padding-left: calc(var(--spacing) * 2) !important;
    }
    [data-ui-component="pagination"][data-ui-part="pagination-link"] {
      outline-style: var(--tw-outline-style);
      outline-width: 1px;
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
    @property --tw-outline-style {
      syntax: "*";
      inherits: false;
      initial-value: solid;
    }
  }
</style>
