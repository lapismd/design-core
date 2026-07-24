<script lang="ts" module>
  export const BUTTON_GROUP_ORIENTATIONS = ["horizontal", "vertical"] as const;
  export type ButtonGroupOrientation =
    (typeof BUTTON_GROUP_ORIENTATIONS)[number];

  /** @deprecated Prefer typed props; retained for API compatibility. */
  export function buttonGroupVariants(_opts?: {
    orientation?: ButtonGroupOrientation;
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
    children,
    orientation = "horizontal",
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    orientation?: ButtonGroupOrientation;
  } = $props();
</script>

<div
  bind:this={ref}
  role="group"
  {...restProps}
  data-ui-component="button-group"
  data-ui-part="button-group"
  data-slot="button-group"
  data-orientation={orientation}
  class={className}
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
    [data-ui-part="button-group-separator"][data-slot="button-group-separator"] {
      position: relative;
    }
    [data-ui-component="button-group"][data-ui-part="button-group-text"],
    [data-ui-component="button-group"][data-ui-part="button-group"] {
      display: flex;
    }
    [data-ui-component="button-group"][data-ui-part="button-group"] {
      width: fit-content;
    }
    [data-ui-component="button-group"][data-ui-part="button-group"][data-orientation="vertical"] {
      flex-direction: column;
    }
    [data-ui-component="button-group"][data-ui-part="button-group-text"] {
      align-items: center;
    }
    [data-ui-component="button-group"][data-ui-part="button-group"] {
      align-items: stretch;
    }
    [data-ui-component="button-group"][data-ui-part="button-group-text"] {
      gap: calc(var(--spacing) * 2);
    }
    [data-ui-part="button-group-separator"][data-slot="button-group-separator"] {
      align-self: stretch;
    }
    [data-ui-component="button-group"][data-ui-part="button-group-text"] {
      border-radius: var(--ui-button-group-radius, calc(var(--radius) * 0.8));
    }
    [data-ui-component="button-group"][data-ui-part="button-group-text"] {
      border-style: var(--tw-border-style);
      border-width: 1px;
    }
    [data-ui-part="button-group-separator"][data-slot="button-group-separator"] {
      background-color: var(--ui-button-group-border-color, var(--input));
    }
    [data-ui-component="button-group"][data-ui-part="button-group-text"] {
      background-color: var(--ui-button-group-background, var(--muted));
    }
    [data-ui-component="button-group"][data-ui-part="button-group-text"] {
      padding-inline: calc(var(--spacing) * 2.5);
    }
    [data-ui-component="button-group"][data-ui-part="button-group-text"] {
      font-size: var(--text-sm);
      line-height: var(--tw-leading, var(--text-sm--line-height));
    }
    [data-ui-component="button-group"][data-ui-part="button-group-text"] {
      --tw-font-weight: var(--font-weight-medium);
      font-weight: var(--font-weight-medium);
    }
    [data-ui-component="button-group"][data-ui-part="button-group-text"] {
      --tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, #0000000d);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow),
        var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
    [data-ui-component="button-group"][data-ui-part="button-group"]:has(
        > [data-slot="button-group"]
      ) {
      gap: calc(var(--spacing) * 2);
    }
    [data-ui-part="button-group-separator"][data-slot="button-group-separator"][data-orientation="horizontal"] {
      margin-inline: 1px;
    }
    [data-ui-part="button-group-separator"][data-slot="button-group-separator"][data-orientation="horizontal"] {
      width: auto;
    }
    [data-ui-part="button-group-separator"][data-slot="button-group-separator"][data-orientation="vertical"] {
      margin-block: 1px;
    }
    [data-ui-part="button-group-separator"][data-slot="button-group-separator"][data-orientation="vertical"] {
      height: auto;
    }
    [data-ui-component="button-group"][data-ui-part="button-group-text"] svg {
      pointer-events: none;
    }
    [data-ui-component="button-group"][data-ui-part="button-group-text"]
      svg:not([class*="size-"]) {
      width: calc(var(--spacing) * 4);
      height: calc(var(--spacing) * 4);
    }
    [data-ui-component="button-group"][data-ui-part="button-group"]
      > :focus-visible {
      position: relative;
    }
    [data-ui-component="button-group"][data-ui-part="button-group"]
      > :focus-visible {
      z-index: 10;
    }
    [data-ui-component="button-group"][data-ui-part="button-group"]:has(
        :is(select[aria-hidden="true"]:last-child)
      )
      > [data-slot="select-trigger"]:last-of-type {
      border-top-right-radius: calc(var(--radius) * 0.8);
      border-bottom-right-radius: calc(var(--radius) * 0.8);
    }
    [data-ui-component="button-group"][data-ui-part="button-group"]
      > [data-slot="select-trigger"]:not([class*="w-"]) {
      width: fit-content;
    }
    [data-ui-component="button-group"][data-ui-part="button-group"][data-orientation="horizontal"]
      > [data-slot] {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    [data-ui-component="button-group"][data-ui-part="button-group"][data-orientation="vertical"]
      > [data-slot] {
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
    }
    [data-ui-component="button-group"][data-ui-part="button-group"][data-orientation="horizontal"]
      > [data-slot]:not(:has(~ [data-slot])) {
      border-top-right-radius: calc(var(--radius) * 0.8) !important;
      border-bottom-right-radius: calc(var(--radius) * 0.8) !important;
    }
    [data-ui-component="button-group"][data-ui-part="button-group"][data-orientation="vertical"]
      > [data-slot]:not(:has(~ [data-slot])) {
      border-bottom-right-radius: calc(var(--radius) * 0.8) !important;
      border-bottom-left-radius: calc(var(--radius) * 0.8) !important;
    }
    [data-ui-component="button-group"][data-ui-part="button-group"][data-orientation="vertical"]
      > [data-slot]
      ~ [data-slot] {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
    [data-ui-component="button-group"][data-ui-part="button-group"][data-orientation="horizontal"]
      > [data-slot]
      ~ [data-slot] {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    [data-ui-component="button-group"][data-ui-part="button-group"][data-orientation="vertical"]
      > [data-slot]
      ~ [data-slot] {
      border-top-style: var(--tw-border-style);
      border-top-width: 0;
    }
    [data-ui-component="button-group"][data-ui-part="button-group"][data-orientation="horizontal"]
      > [data-slot]
      ~ [data-slot] {
      border-left-style: var(--tw-border-style);
      border-left-width: 0;
    }
    [data-ui-component="button-group"][data-ui-part="button-group"] > input {
      flex: 1;
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
  }
</style>
