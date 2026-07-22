<script lang="ts">
  import { Tabs as TabsPrimitive } from "bits-ui";

  let {
    ref = $bindable(null),
    value = $bindable(""),
    class: className,
    ...restProps
  }: TabsPrimitive.RootProps = $props();
</script>

<TabsPrimitive.Root
  bind:ref
  bind:value
  data-ui-component="tabs"
  data-ui-part="tabs"
  data-slot="tabs"
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
    @layer utilities {
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        position: relative;
      }
      [data-ui-component="tabs"][data-ui-part="tabs"] {
        display: flex;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-list"],
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        display: inline-flex;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        height: calc(100% - 1px);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-list"] {
        width: fit-content;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-content"],
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        flex: 1;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-list"],
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        align-items: center;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-list"],
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        justify-content: center;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-list"][data-variant="line"] {
        gap: var(--spacing);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        gap: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="tabs"][data-ui-part="tabs"] {
        gap: calc(var(--spacing) * 2);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-list"] {
        border-radius: var(--radius);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        border-radius: calc(var(--radius) * 0.8);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        border-style: var(--tw-border-style);
        border-width: 1px;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        border-color: #0000;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-list"][data-variant="default"] {
        background-color: var(--muted);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-list"][data-variant="line"] {
        background-color: #0000;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-list"] {
        padding: 3px;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        padding-inline: calc(var(--spacing) * 2);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        padding-block: var(--spacing);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-content"],
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        font-size: var(--text-sm);
        line-height: var(--tw-leading, var(--text-sm--line-height));
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        --tw-font-weight: var(--font-weight-medium);
        font-weight: var(--font-weight-medium);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        white-space: nowrap;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
        color: var(--foreground);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
          color: color-mix(in oklab, var(--foreground) 60%, transparent);
        }
      }
      [data-ui-component="tabs"][data-ui-part="tabs-list"] {
        color: var(--muted-foreground);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] {
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
      [data-ui-component="tabs"][data-ui-part="tabs-content"] {
        --tw-outline-style: none;
        outline-style: none;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-list"]:is(
          :where(.group\/tabs)[data-orientation="vertical"] *
        ),
      .group-data-\[orientation\=vertical\]\/tabs\:h-fit:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs"]
            )[data-orientation="vertical"]
            *
        ) {
        height: fit-content;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :where(.group\/tabs)[data-orientation="vertical"] *
        ),
      .group-data-\[orientation\=vertical\]\/tabs\:w-full:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs"]
            )[data-orientation="vertical"]
            *
        ) {
        width: 100%;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-list"]:is(
          :where(.group\/tabs)[data-orientation="vertical"] *
        ),
      .group-data-\[orientation\=vertical\]\/tabs\:flex-col:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs"]
            )[data-orientation="vertical"]
            *
        ) {
        flex-direction: column;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :where(.group\/tabs)[data-orientation="vertical"] *
        ),
      .group-data-\[orientation\=vertical\]\/tabs\:justify-start:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs"]
            )[data-orientation="vertical"]
            *
        ) {
        justify-content: flex-start;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :where(.group\/tabs-list)[data-variant="line"] *
        ),
      .group-data-\[variant\=line\]\/tabs-list\:bg-transparent:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs-list"]
            )[data-variant="line"]
            *
        ) {
        background-color: #0000;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-list"]:is(
          :where(.group\/tabs):where([data-orientation="horizontal"]) *
        ),
      .group-data-horizontal\/tabs\:h-9:is(
          :where([data-ui-component="tabs"][data-ui-part="tabs"]):where(
              [data-orientation="horizontal"]
            )
            *
        ) {
        height: calc(var(--spacing) * 9);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:after {
        content: var(--tw-content);
        position: absolute;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:after {
        content: var(--tw-content);
        background-color: var(--foreground);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:after {
        content: var(--tw-content);
        opacity: 0;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:after {
        content: var(--tw-content);
        transition-property: opacity;
        transition-timing-function: var(
          --tw-ease,
          var(--default-transition-timing-function)
        );
        transition-duration: var(
          --tw-duration,
          var(--default-transition-duration)
        );
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :where(.group\/tabs)[data-orientation="horizontal"] *
        ):after,
      .group-data-\[orientation\=horizontal\]\/tabs\:after\:inset-x-0:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs"]
            )[data-orientation="horizontal"]
            *
        ):after {
        content: var(--tw-content);
        inset-inline: 0;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :where(.group\/tabs)[data-orientation="horizontal"] *
        ):after,
      .group-data-\[orientation\=horizontal\]\/tabs\:after\:bottom-\[-5px\]:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs"]
            )[data-orientation="horizontal"]
            *
        ):after {
        content: var(--tw-content);
        bottom: -5px;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :where(.group\/tabs)[data-orientation="horizontal"] *
        ):after,
      .group-data-\[orientation\=horizontal\]\/tabs\:after\:h-0\.5:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs"]
            )[data-orientation="horizontal"]
            *
        ):after {
        content: var(--tw-content);
        height: calc(var(--spacing) * 0.5);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :where(.group\/tabs)[data-orientation="vertical"] *
        ):after,
      .group-data-\[orientation\=vertical\]\/tabs\:after\:inset-y-0:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs"]
            )[data-orientation="vertical"]
            *
        ):after {
        content: var(--tw-content);
        inset-block: 0;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :where(.group\/tabs)[data-orientation="vertical"] *
        ):after,
      .group-data-\[orientation\=vertical\]\/tabs\:after\:-right-1:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs"]
            )[data-orientation="vertical"]
            *
        ):after {
        content: var(--tw-content);
        right: calc(var(--spacing) * -1);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :where(.group\/tabs)[data-orientation="vertical"] *
        ):after,
      .group-data-\[orientation\=vertical\]\/tabs\:after\:w-0\.5:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs"]
            )[data-orientation="vertical"]
            *
        ):after {
        content: var(--tw-content);
        width: calc(var(--spacing) * 0.5);
      }
      @media (hover: hover) {
        [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:hover {
          color: var(--foreground);
        }
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:focus-visible {
        border-color: var(--ring);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:focus-visible {
        --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0
          calc(3px + var(--tw-ring-offset-width))
          var(--tw-ring-color, currentcolor);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:focus-visible {
        --tw-ring-color: var(--ring);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:focus-visible {
          --tw-ring-color: color-mix(in oklab, var(--ring) 50%, transparent);
        }
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:focus-visible {
        outline-style: var(--tw-outline-style);
        outline-width: 1px;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:focus-visible {
        outline-color: var(--ring);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:disabled {
        pointer-events: none;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:disabled {
        opacity: 0.5;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:has(
          [data-icon="inline-end"]
        ) {
        padding-right: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:has(
          [data-icon="inline-start"]
        ) {
        padding-left: calc(var(--spacing) * 1.5);
      }
      [data-ui-component="tabs"][data-ui-part="tabs"][data-orientation="horizontal"] {
        flex-direction: column;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-list"][data-variant="line"] {
        border-radius: 0;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :global(.dark) *
        ) {
        color: var(--muted-foreground);
      }
      @media (hover: hover) {
        [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
            :global(.dark) *
          ):hover {
          color: var(--foreground);
        }
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:where(
          [data-state="active"]
        ),
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:where(
          [data-active]:not([data-active="false"])
        ) {
        background-color: var(--background);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:where(
          [data-state="active"]
        ),
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:where(
          [data-active]:not([data-active="false"])
        ) {
        color: var(--foreground);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :where(.group\/tabs-list)[data-variant="default"] *
        ):where([data-state="active"]),
      .group-data-\[variant\=default\]\/tabs-list\:data-active\:shadow-sm:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs-list"]
            )[data-variant="default"]
            *
        ):where([data-state="active"]),
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :where(.group\/tabs-list)[data-variant="default"] *
        ):where([data-active]:not([data-active="false"])),
      .group-data-\[variant\=default\]\/tabs-list\:data-active\:shadow-sm:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs-list"]
            )[data-variant="default"]
            *
        ):where([data-active]:not([data-active="false"])) {
        --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, #0000001a),
          0 1px 2px -1px var(--tw-shadow-color, #0000001a);
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :where(.group\/tabs-list)[data-variant="line"] *
        ):where([data-state="active"]),
      .group-data-\[variant\=line\]\/tabs-list\:data-active\:bg-transparent:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs-list"]
            )[data-variant="line"]
            *
        ):where([data-state="active"]),
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :where(.group\/tabs-list)[data-variant="line"] *
        ):where([data-active]:not([data-active="false"])),
      .group-data-\[variant\=line\]\/tabs-list\:data-active\:bg-transparent:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs-list"]
            )[data-variant="line"]
            *
        ):where([data-active]:not([data-active="false"])) {
        background-color: #0000;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :where(.group\/tabs-list)[data-variant="line"] *
        ):where([data-state="active"]),
      .group-data-\[variant\=line\]\/tabs-list\:data-active\:shadow-none:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs-list"]
            )[data-variant="line"]
            *
        ):where([data-state="active"]),
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :where(.group\/tabs-list)[data-variant="line"] *
        ):where([data-active]:not([data-active="false"])),
      .group-data-\[variant\=line\]\/tabs-list\:data-active\:shadow-none:is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs-list"]
            )[data-variant="line"]
            *
        ):where([data-active]:not([data-active="false"])) {
        --tw-shadow: 0 0 #0000;
        box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
          var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      :is(
          [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
              :where(.group\/tabs-list)[data-variant="line"] *
            ):where([data-state="active"]),
          [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
              :where(.group\/tabs-list)[data-variant="line"] *
            ):where([data-active]:not([data-active="false"]))
        ):after,
      :is(
          .group-data-\[variant\=line\]\/tabs-list\:data-active\:after\:opacity-100:is(
              :where(
                  [data-ui-component="tabs"][data-ui-part="tabs-list"]
                )[data-variant="line"]
                *
            ):where([data-state="active"]),
          .group-data-\[variant\=line\]\/tabs-list\:data-active\:after\:opacity-100:is(
              :where(
                  [data-ui-component="tabs"][data-ui-part="tabs-list"]
                )[data-variant="line"]
                *
            ):where([data-active]:not([data-active="false"]))
        ):after {
        content: var(--tw-content);
        opacity: 1;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :global(.dark) *
        ):where([data-state="active"]),
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :global(.dark) *
        ):where([data-active]:not([data-active="false"])) {
        border-color: var(--input);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :global(.dark) *
        ):where([data-state="active"]),
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :global(.dark) *
        ):where([data-active]:not([data-active="false"])) {
        background-color: var(--input);
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
            :global(.dark) *
          ):where([data-state="active"]),
        [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
            :global(.dark) *
          ):where([data-active]:not([data-active="false"])) {
          background-color: color-mix(in oklab, var(--input) 30%, transparent);
        }
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :global(.dark) *
        ):where([data-state="active"]),
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :global(.dark) *
        ):where([data-active]:not([data-active="false"])) {
        color: var(--foreground);
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :global(.dark) *
        ):is(:where(.group\/tabs-list)[data-variant="line"] *):where(
          [data-state="active"]
        ),
      .dark\:group-data-\[variant\=line\]\/tabs-list\:data-active\:border-transparent:is(
          :global(.dark) *
        ):is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs-list"]
            )[data-variant="line"]
            *
        ):where([data-state="active"]),
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :global(.dark) *
        ):is(:where(.group\/tabs-list)[data-variant="line"] *):where(
          [data-active]:not([data-active="false"])
        ),
      .dark\:group-data-\[variant\=line\]\/tabs-list\:data-active\:border-transparent:is(
          :global(.dark) *
        ):is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs-list"]
            )[data-variant="line"]
            *
        ):where([data-active]:not([data-active="false"])) {
        border-color: #0000;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :global(.dark) *
        ):is(:where(.group\/tabs-list)[data-variant="line"] *):where(
          [data-state="active"]
        ),
      .dark\:group-data-\[variant\=line\]\/tabs-list\:data-active\:bg-transparent:is(
          :global(.dark) *
        ):is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs-list"]
            )[data-variant="line"]
            *
        ):where([data-state="active"]),
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]:is(
          :global(.dark) *
        ):is(:where(.group\/tabs-list)[data-variant="line"] *):where(
          [data-active]:not([data-active="false"])
        ),
      .dark\:group-data-\[variant\=line\]\/tabs-list\:data-active\:bg-transparent:is(
          :global(.dark) *
        ):is(
          :where(
              [data-ui-component="tabs"][data-ui-part="tabs-list"]
            )[data-variant="line"]
            *
        ):where([data-active]:not([data-active="false"])) {
        background-color: #0000;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] svg {
        pointer-events: none;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"] svg {
        flex-shrink: 0;
      }
      [data-ui-component="tabs"][data-ui-part="tabs-trigger"]
        svg:not([class*="size-"]) {
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
    @property --tw-content {
      syntax: "*";
      inherits: false;
      initial-value: "";
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
    @property --tw-outline-style {
      syntax: "*";
      inherits: false;
      initial-value: solid;
    }
  }
</style>
