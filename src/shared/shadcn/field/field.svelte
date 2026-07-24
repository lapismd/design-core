<script lang="ts" module>
  export const FIELD_ORIENTATIONS = [
    "vertical",
    "horizontal",
    "responsive",
  ] as const;
  export type FieldOrientation = (typeof FIELD_ORIENTATIONS)[number];

  /** @deprecated Prefer typed props; retained for API compatibility. */
  export function fieldVariants(_opts?: {
    orientation?: FieldOrientation;
    class?: string;
  }): string {
    return "";
  }
</script>

<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    orientation = "vertical",
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    orientation?: FieldOrientation;
  } = $props();
</script>

<div
  bind:this={ref}
  role="group"
  data-ui-component="field"
  data-ui-part="field"
  data-slot="field"
  data-orientation={orientation}
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
      [data-ui-component="field"][data-ui-part="field-group"] {
        container: field-group/inline-size;
      }
      [data-ui-component="field"][data-ui-part="field-separator-anon-0"] {
        position: absolute;
      }
      [data-ui-component="field"][data-ui-part="field-separator"],
      [data-ui-component="field"][data-ui-part="field-separator-content"] {
        position: relative;
      }
      [data-ui-component="field"][data-ui-part="field-separator-anon-0"] {
        inset: 0;
      }
      [data-ui-component="field"][data-ui-part="field-separator-anon-0"] {
        top: 50%;
      }
      [data-ui-component="field"][data-ui-part="field-separator-content"] {
        margin-inline: auto;
      }
      [data-ui-component="field"][data-ui-part="field-separator"] {
        margin-block: calc(var(--spacing) * -2);
      }
      [data-ui-component="field"][data-ui-part="field-legend"] {
        margin-bottom: calc(var(--spacing) * 3);
      }
      [data-ui-component="field"][data-ui-part="field-ul"] {
        margin-left: calc(var(--spacing) * 4);
      }
      [data-ui-component="field"][data-ui-part="field-separator-content"] {
        display: block;
      }
      [data-ui-component="field"][data-ui-part="field-content"],
      [data-ui-component="field"][data-ui-part="field-ul"],
      [data-ui-component="field"][data-ui-part="field-group"],
      [data-ui-component="field"][data-ui-part="field-label"],
      [data-ui-component="field"][data-ui-part="field-set"],
      [data-ui-component="field"][data-ui-part="field"] {
        display: flex;
      }
      [data-ui-component="field"][data-ui-part="field-separator"] {
        height: calc(var(--spacing) * 5);
      }
      [data-ui-component="field"][data-ui-part="field-label"],
      [data-ui-component="field"][data-ui-part="field-separator-content"] {
        width: fit-content;
      }
      [data-ui-component="field"][data-ui-part="field-group"],
      [data-ui-component="field"][data-ui-part="field"] {
        width: 100%;
      }
      [data-ui-component="field"][data-ui-part="field-content"] {
        flex: 1;
      }
      [data-ui-component="field"][data-ui-part="field-ul"] {
        list-style-type: disc;
      }
      [data-ui-component="field"][data-ui-part="field-content"],
      [data-ui-component="field"][data-ui-part="field-ul"],
      [data-ui-component="field"][data-ui-part="field-group"],
      [data-ui-component="field"][data-ui-part="field-set"],
      [data-ui-component="field"][data-ui-part="field"][data-orientation="vertical"],
      [data-ui-component="field"][data-ui-part="field"][data-orientation="responsive"] {
        flex-direction: column;
      }
      [data-ui-component="field"][data-ui-part="field"][data-orientation="horizontal"] {
        flex-direction: row;
      }
      [data-ui-component="field"][data-ui-part="field-label"],
      [data-ui-component="field"][data-ui-part="field"][data-orientation="horizontal"] {
        align-items: center;
      }
      [data-ui-component="field"][data-ui-part="field-content"],
      [data-ui-component="field"][data-ui-part="field-ul"] {
        gap: var(--spacing);
      }
      [data-ui-component="field"][data-ui-part="field-label"] {
        gap: calc(var(--spacing) * 2);
      }
      [data-ui-component="field"][data-ui-part="field"] {
        gap: calc(var(--spacing) * 3);
      }
      [data-ui-component="field"][data-ui-part="field-set"] {
        gap: calc(var(--spacing) * 6);
      }
      [data-ui-component="field"][data-ui-part="field-group"] {
        gap: calc(var(--spacing) * 7);
      }
      [data-ui-component="field"][data-ui-part="field-separator-content"] {
        background-color: var(--ui-field-background, var(--background));
      }
      [data-ui-component="field"][data-ui-part="field-separator-content"] {
        padding-inline: calc(var(--spacing) * 2);
      }
      [data-ui-component="field"][data-ui-part="field-description"] {
        text-align: left;
      }
      [data-ui-component="field"][data-ui-part="field-description"],
      [data-ui-component="field"][data-ui-part="field-error"],
      [data-ui-component="field"][data-ui-part="field-separator"],
      [data-ui-component="field"][data-ui-part="field-label"] {
        font-size: var(--text-sm);
        line-height: var(--tw-leading, var(--text-sm--line-height));
      }
      [data-ui-component="field"][data-ui-part="field-description"] {
        --tw-leading: var(--leading-normal);
        line-height: var(--leading-normal);
      }
      [data-ui-component="field"][data-ui-part="field-content"],
      [data-ui-component="field"][data-ui-part="field-label"] {
        --tw-leading: var(--leading-snug);
        line-height: var(--leading-snug);
      }
      [data-ui-component="field"][data-ui-part="field-legend"],
      [data-ui-component="field"][data-ui-part="field-label"] {
        --tw-font-weight: var(--font-weight-medium);
        font-weight: var(--font-weight-medium);
      }
      [data-ui-component="field"][data-ui-part="field-description"],
      [data-ui-component="field"][data-ui-part="field-error"] {
        --tw-font-weight: var(--font-weight-normal);
        font-weight: var(--font-weight-normal);
      }
      [data-ui-component="field"][data-ui-part="field-error"] {
        color: var(--destructive);
      }
      [data-ui-component="field"][data-ui-part="field-description"],
      [data-ui-component="field"][data-ui-part="field-separator-content"] {
        color: var(--ui-field-foreground, var(--muted-foreground));
      }
      [data-ui-component="field"][data-ui-part="field-description"]:is(
          :where(.group\/field):has([data-orientation="horizontal"]) *
        ),
      .group-has-\[\[data-orientation\=horizontal\]\]\/field\:text-balance:is(
          :where([data-ui-component="field"][data-ui-part="field"]):has(
              [data-orientation="horizontal"]
            )
            *
        ) {
        text-wrap: balance;
      }
      [data-ui-component="field"][data-ui-part="field-label"]:is(
          :where(.group\/field)[data-disabled="true"] *
        ),
      .group-data-\[disabled\=true\]\/field\:opacity-50:is(
          :where(
              [data-ui-component="field"][data-ui-part="field"]
            )[data-disabled="true"]
            *
        ) {
        opacity: 0.5;
      }
      [data-ui-component="field"][data-ui-part="field-separator"]:is(
          :where(
              [data-ui-component="field"][data-ui-part="field-group"]
            )[data-variant="outline"]
            *
        ) {
        margin-bottom: calc(var(--spacing) * -2);
      }
      [data-ui-component="field"][data-ui-part="field-description"]:last-child {
        margin-top: 0;
      }
      [data-ui-component="field"][data-ui-part="field-label"]:has(
          :where([data-state="checked"]),
          :where([data-checked]:not([data-checked="false"]))
        ) {
        border-color: var(--ui-field-border-color, var(--primary));
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="field"][data-ui-part="field-label"]:has(
            :where([data-state="checked"]),
            :where([data-checked]:not([data-checked="false"]))
          ) {
          border-color: color-mix(
            in oklab,
            var(--ui-field-border-color, var(--primary)) 30%,
            transparent
          );
        }
      }
      [data-ui-component="field"][data-ui-part="field-label"]:has(
          :where([data-state="checked"]),
          :where([data-checked]:not([data-checked="false"]))
        ) {
        background-color: var(--ui-field-focus-ring-color, var(--primary));
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="field"][data-ui-part="field-label"]:has(
            :where([data-state="checked"]),
            :where([data-checked]:not([data-checked="false"]))
          ) {
          background-color: color-mix(
            in oklab,
            var(--ui-field-focus-ring-color, var(--primary)) 5%,
            transparent
          );
        }
      }
      [data-ui-component="field"][data-ui-part="field-set"]:has(
          > [data-slot="checkbox-group"]
        ) {
        gap: calc(var(--spacing) * 3);
      }
      [data-ui-component="field"][data-ui-part="field"][data-orientation="horizontal"]:has(
          > [data-slot="field-content"]
        ) {
        align-items: flex-start;
      }
      [data-ui-component="field"][data-ui-part="field-label"]:has(
          > [data-slot="field"]
        ) {
        width: 100%;
      }
      [data-ui-component="field"][data-ui-part="field-label"]:has(
          > [data-slot="field"]
        ) {
        flex-direction: column;
      }
      [data-ui-component="field"][data-ui-part="field-label"]:has(
          > [data-slot="field"]
        ) {
        border-radius: var(--ui-field-radius, calc(var(--radius) * 0.8));
      }
      [data-ui-component="field"][data-ui-part="field-label"]:has(
          > [data-slot="field"]
        ) {
        border-style: var(--tw-border-style);
        border-width: 1px;
      }
      [data-ui-component="field"][data-ui-part="field-set"]:has(
          > [data-slot="radio-group"]
        ) {
        gap: calc(var(--spacing) * 3);
      }
      [data-ui-component="field"][data-ui-part="field"][data-invalid="true"] {
        color: var(--destructive);
      }
      [data-ui-component="field"][data-ui-part="field-group"][data-slot="checkbox-group"] {
        gap: calc(var(--spacing) * 3);
      }
      :is(
          [data-ui-component="field"][data-ui-part="field-label"] > *
        )[data-slot="field"] {
        padding: calc(var(--spacing) * 3);
      }
      :is(
          [data-ui-component="field"][data-ui-part="field-group"] > *
        )[data-slot="field-group"] {
        gap: calc(var(--spacing) * 4);
      }
      [data-ui-component="field"][data-ui-part="field-legend"][data-variant="label"] {
        font-size: var(--text-sm);
        line-height: var(--tw-leading, var(--text-sm--line-height));
      }
      [data-ui-component="field"][data-ui-part="field-legend"][data-variant="legend"] {
        font-size: var(--text-base);
        line-height: var(--tw-leading, var(--text-base--line-height));
      }
      [data-ui-component="field"][data-ui-part="field-description"]:nth-last-child(
          2
        ) {
        margin-top: calc(var(--spacing) * -1);
      }
      @container field-group (min-width:28rem) {
        [data-ui-component="field"][data-ui-part="field"][data-orientation="responsive"] {
          flex-direction: row;
        }
        [data-ui-component="field"][data-ui-part="field"][data-orientation="responsive"] {
          align-items: center;
        }
        [data-ui-component="field"][data-ui-part="field"][data-orientation="responsive"]:has(
            > [data-slot="field-content"]
          ) {
          align-items: flex-start;
        }
      }
      [data-ui-component="field"][data-ui-part="field-label"]:is(
          :global(.dark) *
        ):has(
          :where([data-state="checked"]),
          :where([data-checked]:not([data-checked="false"]))
        ) {
        border-color: var(--ui-field-border-color, var(--primary));
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="field"][data-ui-part="field-label"]:is(
            :global(.dark) *
          ):has(
            :where([data-state="checked"]),
            :where([data-checked]:not([data-checked="false"]))
          ) {
          border-color: color-mix(
            in oklab,
            var(--ui-field-border-color, var(--primary)) 20%,
            transparent
          );
        }
      }
      [data-ui-component="field"][data-ui-part="field-label"]:is(
          :global(.dark) *
        ):has(
          :where([data-state="checked"]),
          :where([data-checked]:not([data-checked="false"]))
        ) {
        background-color: var(--ui-field-focus-ring-color, var(--primary));
      }
      @supports (color: color-mix(in lab, red, red)) {
        [data-ui-component="field"][data-ui-part="field-label"]:is(
            :global(.dark) *
          ):has(
            :where([data-state="checked"]),
            :where([data-checked]:not([data-checked="false"]))
          ) {
          background-color: color-mix(
            in oklab,
            var(--ui-field-focus-ring-color, var(--primary)) 10%,
            transparent
          );
        }
      }
      [data-ui-component="field"][data-ui-part="field"][data-orientation="vertical"]
        > *,
      [data-ui-component="field"][data-ui-part="field"][data-orientation="responsive"]
        > * {
        width: 100%;
      }
      @container field-group (min-width:28rem) {
        [data-ui-component="field"][data-ui-part="field"][data-orientation="responsive"]
          > * {
          width: auto;
        }
      }
      [data-ui-component="field"][data-ui-part="field"][data-orientation="vertical"]
        > .sr-only,
      [data-ui-component="field"][data-ui-part="field"][data-orientation="responsive"]
        > .sr-only {
        width: auto;
      }
      [data-ui-component="field"][data-ui-part="field"][data-orientation="horizontal"]
        > [data-slot="field-label"] {
        flex: auto;
      }
      @container field-group (min-width:28rem) {
        [data-ui-component="field"][data-ui-part="field"][data-orientation="responsive"]
          > [data-slot="field-label"] {
          flex: auto;
        }
      }
      [data-ui-component="field"][data-ui-part="field"][data-orientation="horizontal"]:has(
          > [data-slot="field-content"]
        )
        > [role="checkbox"],
      [data-ui-component="field"][data-ui-part="field"][data-orientation="horizontal"]:has(
          > [data-slot="field-content"]
        )
        [role="radio"] {
        margin-top: 1px;
      }
      @container field-group (min-width:28rem) {
        [data-ui-component="field"][data-ui-part="field"][data-orientation="responsive"]:has(
            > [data-slot="field-content"]
          )
          > [role="checkbox"],
        [data-ui-component="field"][data-ui-part="field"][data-orientation="responsive"]:has(
            > [data-slot="field-content"]
          )
          [role="radio"] {
          margin-top: 1px;
        }
      }
      [data-ui-component="field"][data-ui-part="field-description"] > a {
        text-decoration-line: underline;
      }
      [data-ui-component="field"][data-ui-part="field-description"] > a {
        text-underline-offset: 4px;
      }
      [data-ui-component="field"][data-ui-part="field-description"] > a:hover {
        color: var(--ui-field-focus-ring-color, var(--primary));
      }
      [data-variant="legend"]
        + [data-ui-component="field"][data-ui-part="field-description"] {
        margin-top: calc(var(--spacing) * -1.5);
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
    @property --tw-leading {
      syntax: "*";
      inherits: false;
    }
    @property --tw-font-weight {
      syntax: "*";
      inherits: false;
    }
    @property --tw-border-style {
      syntax: "*";
      inherits: false;
      initial-value: solid;
    }
  }
</style>
