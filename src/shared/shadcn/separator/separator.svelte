<script lang="ts">
  import { Separator as SeparatorPrimitive } from "bits-ui";
  import {
    omitDataUiComponent,
    resolveDataUiComponent,
  } from "../../../lib/data-ui-host.js";

  let {
    ref = $bindable(null),
    class: className,
    "data-slot": dataSlot = "separator",
    dataUiComponent,
    ...restProps
  }: SeparatorPrimitive.RootProps & {
    dataUiComponent?: string;
  } = $props();
</script>

<SeparatorPrimitive.Root
  bind:ref
  {...omitDataUiComponent(restProps)}
  data-ui-component={resolveDataUiComponent("separator", dataUiComponent)}
  data-slot={dataSlot}
  class={className}
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
    @layer utilities {
      [data-ui-component="separator"] {
        flex-shrink: 0;
      }
      [data-ui-component="separator"] {
        background-color: var(--border);
      }
      [data-ui-component="separator"][data-orientation="horizontal"] {
        height: 1px;
      }
      [data-ui-component="separator"][data-orientation="horizontal"] {
        width: 100%;
      }
      [data-ui-component="separator"][data-orientation="vertical"] {
        height: 100%;
      }
      [data-ui-component="separator"][data-orientation="vertical"] {
        width: 1px;
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
  }
</style>
