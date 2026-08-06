<script lang="ts">
  import { Progress as ProgressPrimitive } from "bits-ui";
  import { type WithoutChildrenOrChild } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    max = 100,
    value,
    ...restProps
  }: WithoutChildrenOrChild<ProgressPrimitive.RootProps> = $props();
</script>

<ProgressPrimitive.Root
  bind:ref
  data-ui-component="progress"
  data-ui-part="progress"
  data-slot="progress"
  class={className}
  {value}
  {max}
  {...restProps}
>
  <div
    data-ui-component="progress"
    data-ui-part="progress-indicator"
    data-slot="progress-indicator"
    style="transform: translateX(-{100 - (100 * (value ?? 0)) / (max ?? 1)}%)"
  ></div>
</ProgressPrimitive.Root>

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
    [data-ui-component="progress"][data-ui-part="progress"] {
      position: relative;
    }
    [data-ui-component="progress"][data-ui-part="progress"] {
      display: flex;
    }
    [data-ui-component="progress"][data-ui-part="progress-indicator"] {
      width: 100%;
      height: 100%;
    }
    [data-ui-component="progress"][data-ui-part="progress"] {
      height: calc(var(--spacing) * 1.5);
    }
    [data-ui-component="progress"][data-ui-part="progress"] {
      width: 100%;
    }
    [data-ui-component="progress"][data-ui-part="progress-indicator"] {
      flex: 1;
    }
    [data-ui-component="progress"][data-ui-part="progress"] {
      align-items: center;
    }
    [data-ui-component="progress"][data-ui-part="progress"] {
      overflow-x: hidden;
    }
    [data-ui-component="progress"][data-ui-part="progress"] {
      border-radius: 3.40282e38px;
    }
    [data-ui-component="progress"][data-ui-part="progress"] {
      background-color: var(--muted);
    }
    [data-ui-component="progress"][data-ui-part="progress-indicator"] {
      background-color: var(--primary);
    }
    [data-ui-component="progress"][data-ui-part="progress-indicator"] {
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
  }
</style>
