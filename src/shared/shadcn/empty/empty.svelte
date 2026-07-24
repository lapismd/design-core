<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  data-ui-component="empty"
  data-ui-part="empty"
  data-slot="empty"
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
      [data-ui-component="empty"][data-ui-part="empty-media"] {
        margin-bottom: calc(var(--spacing) * 2);
      }
      [data-ui-component="empty"][data-ui-part="empty-content"],
      [data-ui-component="empty"][data-ui-part="empty-header"],
      [data-ui-component="empty"][data-ui-part="empty-media"],
      [data-ui-component="empty"][data-ui-part="empty-media"][data-variant="icon"],
      [data-ui-component="empty"][data-ui-part="empty"] {
        display: flex;
      }
      [data-ui-component="empty"][data-ui-part="empty-media"][data-variant="icon"] {
        width: calc(var(--spacing) * 10);
        height: calc(var(--spacing) * 10);
      }
      [data-ui-component="empty"][data-ui-part="empty-content"],
      [data-ui-component="empty"][data-ui-part="empty"] {
        width: 100%;
      }
      [data-ui-component="empty"][data-ui-part="empty-content"],
      [data-ui-component="empty"][data-ui-part="empty-header"] {
        max-width: var(--container-sm);
      }
      [data-ui-component="empty"][data-ui-part="empty-content"],
      [data-ui-component="empty"][data-ui-part="empty"] {
        min-width: 0;
      }
      [data-ui-component="empty"][data-ui-part="empty"] {
        flex: 1;
      }
      [data-ui-component="empty"][data-ui-part="empty-media"],
      [data-ui-component="empty"][data-ui-part="empty-media"][data-variant="icon"] {
        flex-shrink: 0;
      }
      [data-ui-component="empty"][data-ui-part="empty-content"],
      [data-ui-component="empty"][data-ui-part="empty-header"],
      [data-ui-component="empty"][data-ui-part="empty"] {
        flex-direction: column;
      }
      [data-ui-component="empty"][data-ui-part="empty-content"],
      [data-ui-component="empty"][data-ui-part="empty-header"],
      [data-ui-component="empty"][data-ui-part="empty-media"],
      [data-ui-component="empty"][data-ui-part="empty-media"][data-variant="icon"],
      [data-ui-component="empty"][data-ui-part="empty"] {
        align-items: center;
      }
      [data-ui-component="empty"][data-ui-part="empty-media"],
      [data-ui-component="empty"][data-ui-part="empty-media"][data-variant="icon"],
      [data-ui-component="empty"][data-ui-part="empty"] {
        justify-content: center;
      }
      [data-ui-component="empty"][data-ui-part="empty-header"] {
        gap: calc(var(--spacing) * 2);
      }
      [data-ui-component="empty"][data-ui-part="empty-content"],
      [data-ui-component="empty"][data-ui-part="empty"] {
        gap: calc(var(--spacing) * 4);
      }
      [data-ui-component="empty"][data-ui-part="empty-media"][data-variant="icon"],
      [data-ui-component="empty"][data-ui-part="empty"] {
        border-radius: var(--radius);
      }
      [data-ui-component="empty"][data-ui-part="empty"] {
        --tw-border-style: dashed;
        border-style: dashed;
      }
      [data-ui-component="empty"][data-ui-part="empty-media"][data-variant="icon"] {
        background-color: var(--muted);
      }
      [data-ui-component="empty"][data-ui-part="empty-media"][data-variant="default"] {
        background-color: #0000;
      }
      [data-ui-component="empty"][data-ui-part="empty"] {
        padding: calc(var(--spacing) * 12);
      }
      [data-ui-component="empty"][data-ui-part="empty"] {
        text-align: center;
      }
      [data-ui-component="empty"][data-ui-part="empty-title"] {
        font-size: var(--text-lg);
        line-height: var(--tw-leading, var(--text-lg--line-height));
      }
      [data-ui-component="empty"][data-ui-part="empty-content"] {
        font-size: var(--text-sm);
        line-height: var(--tw-leading, var(--text-sm--line-height));
      }
      [data-ui-component="empty"][data-ui-part="empty-description"] {
        font-size: var(--text-sm);
        line-height: var(--leading-relaxed);
      }
      [data-ui-component="empty"][data-ui-part="empty-title"] {
        --tw-font-weight: var(--font-weight-medium);
        font-weight: var(--font-weight-medium);
      }
      [data-ui-component="empty"][data-ui-part="empty-title"] {
        --tw-tracking: var(--tracking-tight);
        letter-spacing: var(--tracking-tight);
      }
      [data-ui-component="empty"][data-ui-part="empty-content"],
      [data-ui-component="empty"][data-ui-part="empty"] {
        text-wrap: balance;
      }
      [data-ui-component="empty"][data-ui-part="empty-media"][data-variant="icon"] {
        color: var(--foreground);
      }
      [data-ui-component="empty"][data-ui-part="empty-description"] {
        color: var(--ui-empty-foreground, var(--muted-foreground));
      }
      [data-ui-component="empty"][data-ui-part="empty-media"] svg {
        pointer-events: none;
      }
      [data-ui-component="empty"][data-ui-part="empty-media"] svg {
        flex-shrink: 0;
      }
      [data-ui-component="empty"][data-ui-part="empty-media"][data-variant="icon"]
        svg:not([class*="size-"]) {
        width: calc(var(--spacing) * 6);
        height: calc(var(--spacing) * 6);
      }
      [data-ui-component="empty"][data-ui-part="empty-description"] > a {
        text-decoration-line: underline;
      }
      [data-ui-component="empty"][data-ui-part="empty-description"] > a {
        text-underline-offset: 4px;
      }
      [data-ui-component="empty"][data-ui-part="empty-description"] > a:hover {
        color: var(--primary);
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
    @property --tw-tracking {
      syntax: "*";
      inherits: false;
    }
  }
</style>
